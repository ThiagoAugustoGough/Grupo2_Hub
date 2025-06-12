document.addEventListener('DOMContentLoaded', () => {

    // ---===[ SITE & CHALLENGE ELEMENTS ]===---
    const progressFill = document.getElementById('progressFill');
    const challengeModal = document.getElementById('challengeModal');
    const challengeTitle = document.getElementById('challengeTitle');
    const challengeText = document.getElementById('challengeText');
    const userResponse = document.getElementById('userResponse');

    // ---===[ GAME ELEMENTS ]===---
    const gameModal = document.getElementById('gameModal');
    const closeGameBtn = document.getElementById('close-game-btn');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // ---===[ SITE STATE & DATA ]===---
    let completedSteps = JSON.parse(localStorage.getItem('completedSteps')) || [];
    let stepResponses = JSON.parse(localStorage.getItem('stepResponses')) || {};
    let currentStep = null;
    const challenges = {
        1: 'Escreva 3 frutas que você mais gosta.',
        2: 'Dê um exemplo de alimento in natura.',
        3: 'Cite 2 alimentos processados que consome.',
        // Step 4 is the game, so it doesn't need a question.
        5: 'Com quem você costuma fazer refeições?',
        6: 'Onde você costuma comprar seus alimentos?',
        7: 'Qual sua receita favorita para compartilhar?',
        8: 'Quantas refeições você planejou esta semana?',
        9: 'Dê um exemplo de restaurante com comida caseira.',
        10: 'Já viu alguma propaganda que parecia enganar? Qual?'
    };


    // ---===[ INITIALIZATION ]===---
    function initializeSite() {
        document.querySelectorAll('.step-card').forEach(card => {
            const stepNumber = parseInt(card.dataset.step);
            if (completedSteps.includes(stepNumber)) {
                card.classList.add('completed');
                card.querySelector('.step-description').style.display = 'block';
            } else {
                card.querySelector('.step-description').style.display = 'none';
            }
            card.addEventListener('click', () => {
                if (stepNumber === 4) {
                    startGame();
                } else {
                    openChallengeModal(stepNumber);
                }
            });
        });
        updateProgress();
    }


    // ---===[ SITE & PROGRESS FUNCTIONS ]===---
    function updateProgress() {
        // FIX: The total number of steps is 10.
        const totalSteps = 10;
        const percent = (completedSteps.length / totalSteps) * 100;
        progressFill.style.width = `${percent}%`;
    }

    function saveProgress() {
        localStorage.setItem('completedSteps', JSON.stringify(completedSteps));
        localStorage.setItem('stepResponses', JSON.stringify(stepResponses));
    }

    function markStepAsComplete(step) {
        if (!completedSteps.includes(step)) {
            completedSteps.push(step);
            const card = document.querySelector(`.step-card[data-step='${step}']`);
            if (card) {
                card.classList.add('completed');
                card.querySelector('.step-description').style.display = 'block';
            }
            updateProgress();
            saveProgress();
        }
    }
    
    // ---===[ TEXT CHALLENGE MODAL FUNCTIONS ]===---
    window.openChallengeModal = function(step) {
        currentStep = step;
        challengeTitle.textContent = `Desafio do Passo ${step}`;
        challengeText.textContent = challenges[step];
        userResponse.value = stepResponses[step] || '';
        challengeModal.style.display = 'flex';
    }

    window.completeChallenge = function() {
        const response = userResponse.value.trim();
        if (!response) {
            alert('Por favor, responda o desafio antes de concluir.');
            return;
        }
        stepResponses[currentStep] = response;
        markStepAsComplete(currentStep);
        alert('🎉 Avokiddo está orgulhoso de você!');
        challengeModal.style.display = 'none';
    }

    window.closeChallengeModal = function() {
        challengeModal.style.display = 'none';
    }

    // ---===[ RESET FUNCTION ]===---
    window.resetProgress = function() {
        if (confirm('Tem certeza que deseja reiniciar todos os desafios?')) {
            completedSteps = [];
            stepResponses = {};
            localStorage.removeItem('completedSteps');
            localStorage.removeItem('stepResponses');
            document.querySelectorAll('.step-card').forEach(card => {
                card.classList.remove('completed');
                card.querySelector('.step-description').style.display = 'none';
            });
            updateProgress();
        }
    }

    // ---===================================---
    // ---===[           GAME LOGIC          ]===---
    // ---===================================---

    let player, gameObstacles, gameFrameCount, score, animationFrameId;
    let gameState = 'stopped'; // Can be 'playing', 'won', 'lost', 'stopped'

    const playerImage = new Image();
    playerImage.src = 'img/Avokiddo_pixel_no_background.png';
    const obstacleImage = new Image();
    obstacleImage.src = 'img/pixel_sausage_no_back-Photoroom.png';

    const obstacleDrawWidth = 60, obstacleDrawHeight = 80;
    const obstacleHitboxWidth = 15, obstacleHitboxHeight = 30;
    
    function initializeGame() {
        player = { x: 50, y: canvas.height - 70, width: 70, height: 70, velocityY: 0, isJumping: false };
        gameObstacles = [];
        gameFrameCount = 0;
        score = 0;
        gameState = 'playing';
    }

    function gameLoop() {
        if (gameState === 'playing') {
            updateGameState();
        }
        drawGame();
        if (gameState !== 'stopped') {
            animationFrameId = requestAnimationFrame(gameLoop);
        }
    }

    function updateGameState() {
        if (player.isJumping) {
            player.velocityY += 1.5;
            player.y += player.velocityY;
            if (player.y > canvas.height - player.height) {
                player.y = canvas.height - player.height;
                player.velocityY = 0;
                player.isJumping = false;
            }
        }
        gameFrameCount++;
        if (gameFrameCount > 0 && gameFrameCount % 120 === 0) {
            gameObstacles.push({ x: canvas.width, y: canvas.height - obstacleDrawHeight });
        }
        for (let i = gameObstacles.length - 1; i >= 0; i--) {
            gameObstacles[i].x -= 5;
            if (gameObstacles[i].x + obstacleDrawWidth < 0) {
                gameObstacles.splice(i, 1);
                score++;
                if (score >= 5) {
                    winGame();
                    return;
                }
            }
            const hitbox = { x: gameObstacles[i].x, y: gameObstacles[i].y, width: obstacleHitboxWidth, height: obstacleHitboxHeight };
            if (player.x < hitbox.x + hitbox.width/2 && player.x + player.width/2 > hitbox.x && player.y < hitbox.y + hitbox.height/2 && player.y + player.height/2 > hitbox.y) {
                loseGame();
                return;
            }
        }
    }

    function drawGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
        for (const obs of gameObstacles) {
            ctx.drawImage(obstacleImage, obs.x, obs.y, obstacleDrawWidth, obstacleDrawHeight);
        }
        if (gameState === 'playing') {
            ctx.fillStyle = '#000';
            ctx.font = '24px Poppins';
            ctx.fillText('Pontuação: ' + score, 10, 30);
        }
        if (gameState === 'won') {
            displayEndGameMessage('Você Venceu!', 'Parabéns por completar o desafio!');
        } else if (gameState === 'lost') {
            displayEndGameMessage('Fim de Jogo!', 'Pressione ESPAÇO ou TOQUE para tentar de novo.');
        }
    }

    // NEW: Central function to trigger a jump
    function triggerJump() {
        if (!player.isJumping && gameState === 'playing') {
            player.velocityY = -20;
            player.isJumping = true;
        }
    }

    // MODIFIED: This now calls the central jump function
    function handleKeyDown(e) {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault(); // Prevents spacebar from scrolling the page
            triggerJump();
        }
    }
    
    // NEW: Handles touch events for jumping
    function handleTouch(e) {
        e.preventDefault(); // Prevents screen from zooming or scrolling
        triggerJump();
    }

    function startGame() {
        gameModal.style.display = 'flex';
        initializeGame();
        gameLoop();
        // Add listeners for both keyboard and touch
        document.addEventListener('keydown', handleKeyDown);
        canvas.addEventListener('touchstart', handleTouch);
    }

    function stopGame() {
        gameState = 'stopped';
        cancelAnimationFrame(animationFrameId);
        gameModal.style.display = 'none';
        // Remove listeners when the game stops
        document.removeEventListener('keydown', handleKeyDown);
        canvas.removeEventListener('touchstart', handleTouch);
    }
    
    function displayEndGameMessage(title, subtitle) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 40px Poppins';
        ctx.textAlign = 'center';
        ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '20px Poppins';
        ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 20);
        ctx.textAlign = 'left';
    }

    function winGame() {
        gameState = 'won';
        markStepAsComplete(4);
    }
    
    function loseGame() {
        gameState = 'lost';
    }

    // ---===[ GENERAL EVENT LISTENERS ]===---
    closeGameBtn.addEventListener('click', stopGame);

    function handleRestart(e) {
        if (gameState === 'lost' && gameModal.style.display === 'flex') {
            // Check for spacebar or a touch event
            if (e.type === 'keydown' && e.code === 'Space') {
                 initializeGame();
            } else if (e.type === 'touchstart') {
                e.preventDefault();
                initializeGame();
            }
        }
    }
    
    // Add listeners for restarting the game
    document.addEventListener('keydown', handleRestart);
    canvas.addEventListener('touchstart', handleRestart);
    
    // ---===[ KICK OFF THE SITE ]===---
    initializeSite();
});
