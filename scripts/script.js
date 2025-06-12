document.addEventListener('DOMContentLoaded', () => {

    // ---===[ SITE & CHALLENGE ELEMENTS ]===---
    const progressFill = document.getElementById('progressFill');
    const challengeModal = document.getElementById('challengeModal');
    const challengeTitle = document.getElementById('challengeTitle');
    const challengeText = document.getElementById('challengeText');
    const userResponse = document.getElementById('userResponse');
    const step1GameModal = document.getElementById('step1GameModal');


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
        // Step 1 is now the drag-and-drop game
        2: 'Dê um exemplo de alimento in natura.',
        3: 'Cite 2 alimentos processados que consome.',
        // Step 4 is the runner game
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
                // Route to the correct modal based on step number
                if (stepNumber === 1) {
                    openStep1GameModal();
                } else if (stepNumber === 4) {
                    startGame();
                } else {
                    openChallengeModal(stepNumber);
                }
            });
        });
        initializeDragAndDrop();
        updateProgress();
    }


    // ---===[ SITE & PROGRESS FUNCTIONS ]===---
    function updateProgress() {
        const totalSteps = 10;
        const percent = (completedSteps.length / totalSteps) * 100;
        progressFill.style.width = `${percent}%`;
    }

    function saveProgress() {
        localStorage.setItem('completedSteps', JSON.stringify(completedSteps));
        localStorage.setItem('stepResponses', JSON.stringify(stepResponses));
    }

    window.closeFinalModal = function() {
        const finalModal = document.getElementById('finalModal');
        if (finalModal) {
            finalModal.style.display = 'none';
        }
    };


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

            // Check for completion after marking a step as complete
            if (completedSteps.length === 10) { 
                 setTimeout(() => {
                    document.getElementById('finalModal').style.display = 'flex';
                }, 500);
            }
        }
    }

    // ---===[ STEP 1 DRAG-AND-DROP GAME FUNCTIONS (RE-FIXED: ROBUST TOUCH LOGIC) ]===---

    function initializeDragAndDrop() {
        const foodItems = document.querySelectorAll('.food-item');
        const plateZone = document.getElementById('plate');
        const optionsZone = document.querySelector('.food-options');
        const allDropZones = [plateZone, optionsZone];

        let draggedItem = null;
        let offsetX = 0, offsetY = 0;

        // --- Mouse Events (for Desktop) ---
        foodItems.forEach(item => {
            item.addEventListener('dragstart', e => {
                draggedItem = e.target;
                setTimeout(() => e.target.style.opacity = '0.5', 0);
            });
            item.addEventListener('dragend', () => {
                if (draggedItem) draggedItem.style.opacity = '1';
                draggedItem = null;
            });
        });

        // --- Touch Events (for Mobile) ---
        document.addEventListener('touchstart', e => {
            if (!e.target.classList.contains('food-item')) return;
            
            draggedItem = e.target;
            const touch = e.touches[0];
            const rect = draggedItem.getBoundingClientRect();

            // Calculate offset of touch from element's top-left corner
            offsetX = touch.clientX - rect.left;
            offsetY = touch.clientY - rect.top;

            // Style the element for dragging
            draggedItem.classList.add('dragging');
            draggedItem.style.left = `${touch.clientX - offsetX}px`;
            draggedItem.style.top = `${touch.clientY - offsetY}px`;
            draggedItem.style.width = `${rect.width}px`;

        }, { passive: false });

        document.addEventListener('touchmove', e => {
            if (!draggedItem) return;
            e.preventDefault(); // Prevent scrolling while dragging

            const touch = e.touches[0];
            
            // Move the item with the finger
            draggedItem.style.left = `${touch.clientX - offsetX}px`;
            draggedItem.style.top = `${touch.clientY - offsetY}px`;

            // Check for hover over any drop zone
            allDropZones.forEach(zone => {
                const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
                if (zone === elementUnderTouch || zone.contains(elementUnderTouch)) {
                    zone.classList.add('hovered');
                } else {
                    zone.classList.remove('hovered');
                }
            });
        }, { passive: false });

        document.addEventListener('touchend', e => {
            if (!draggedItem) return;
            
            const touch = e.changedTouches[0];
            const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
            let droppedZone = null;

            // Find which drop zone the item was released over
            if (allDropZones.includes(elementUnderTouch)) {
                droppedZone = elementUnderTouch;
            } else {
                let parent = elementUnderTouch;
                while(parent) {
                    if (allDropZones.includes(parent)) {
                        droppedZone = parent;
                        break;
                    }
                    parent = parent.parentElement;
                }
            }

            if (droppedZone) {
                droppedZone.appendChild(draggedItem);
            }
            
            // Reset styles on the dragged item
            draggedItem.classList.remove('dragging');
            draggedItem.style.left = '';
            draggedItem.style.top = '';
            draggedItem.style.width = '';

            // Remove hover styles from all zones
            allDropZones.forEach(zone => zone.classList.remove('hovered'));

            draggedItem = null;
        });

        // --- Common Drop Zone Events (for Desktop) ---
        allDropZones.forEach(zone => {
            zone.addEventListener('dragover', e => {
                e.preventDefault();
                zone.classList.add('hovered');
            });
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('hovered');
            });
            zone.addEventListener('drop', e => {
                e.preventDefault();
                if (draggedItem) {
                    zone.appendChild(draggedItem);
                }
                zone.classList.remove('hovered');
            });
        });
    }


    function openStep1GameModal() {
        step1GameModal.style.display = 'flex';
        const feedback = document.getElementById('step1-feedback');
        feedback.textContent = '';
        feedback.className = 'feedback-message';
    }

    window.closeStep1GameModal = function() {
        step1GameModal.style.display = 'none';
    }

    window.checkPlate = function() {
        const plate = document.getElementById('plate');
        const itemsOnPlate = Array.from(plate.querySelectorAll('.food-item'));
        const foodOnPlate = itemsOnPlate.map(item => item.dataset.food);

        const correctItems = ['arroz', 'banana', 'frango'];
        const incorrectItems = ['nuggets', 'cenoura'];

        const hasAllCorrect = correctItems.every(item => foodOnPlate.includes(item));
        const hasNoIncorrect = !incorrectItems.some(item => foodOnPlate.includes(item));

        const feedback = document.getElementById('step1-feedback');

        if (hasAllCorrect && hasNoIncorrect && foodOnPlate.length === correctItems.length) {
            feedback.textContent = 'Correto! Você montou um prato saudável e natural. Mandou bem!';
            feedback.className = 'feedback-message correct';
            markStepAsComplete(1);
            setTimeout(() => {
                closeStep1GameModal();
                alert('🎉 Avokiddo está orgulhoso de você!');
            }, 1500);
        } else {
            feedback.textContent = 'Opa, parece que tem algo errado no prato. Lembre-se: apenas alimentos in natura. Tente de novo!';
            feedback.className = 'feedback-message incorrect';
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
        challengeModal.style.display = 'none';
        alert('🎉 Avokiddo está orgulhoso de você!');
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
            
            const foodOptions = document.querySelector('.food-options');
            const plate = document.getElementById('plate');
            const itemsOnPlate = Array.from(plate.querySelectorAll('.food-item'));
            itemsOnPlate.forEach(item => foodOptions.appendChild(item));

            updateProgress();
        }
    }

    // ---===================================---
    // ---===[ GAME LOGIC (Step 4)   ]===---
    // ---===================================---

    let player, gameObstacles, gameFrameCount, score, animationFrameId;
    let gameState = 'stopped';

    const playerImage = new Image();
    playerImage.src = 'img/Avokiddo_pixel_no_background.png';
    const obstacleImage = new Image();
    obstacleImage.src = 'img/pixel_sausage_no_back-Photoroom.png';

    const obstacleDrawWidth = 60, obstacleDrawHeight = 80;
    
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
            if (player.x < gameObstacles[i].x + obstacleDrawWidth && player.x + player.width/2 > gameObstacles[i].x && player.y < gameObstacles[i].y + obstacleDrawHeight && player.y + player.height/2 > gameObstacles[i].y) {
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

    function triggerJump() {
        if (!player.isJumping && gameState === 'playing') {
            player.velocityY = -20;
            player.isJumping = true;
        }
    }

    function handleKeyDown(e) {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            triggerJump();
        }
    }
    
    function handleTouch(e) {
        e.preventDefault();
        triggerJump();
    }

    function startGame() {
        gameModal.style.display = 'flex';
        initializeGame();
        gameLoop();
        document.addEventListener('keydown', handleKeyDown);
        canvas.addEventListener('touchstart', handleTouch);
    }

    function stopGame() {
        gameState = 'stopped';
        cancelAnimationFrame(animationFrameId);
        gameModal.style.display = 'none';
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
            if (e.type === 'keydown' && e.code === 'Space') {
                 initializeGame();
            } else if (e.type === 'touchstart') {
                e.preventDefault();
                initializeGame();
            }
        }
    }
    
    document.addEventListener('keydown', handleRestart);
    canvas.addEventListener('touchstart', handleRestart);
    
    // ---===[ KICK OFF THE SITE ]===---
    initializeSite();
});