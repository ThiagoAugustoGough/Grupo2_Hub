document.addEventListener('DOMContentLoaded', () => {

    // --- HTML Element References ---
    const gameModal = document.getElementById('game-modal');
    const gameLauncher = document.getElementById('passo4-launcher');
    const closeGameBtn = document.getElementById('close-game-btn');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // --- Game State Variables ---
    let player, obstacles, frameCount, score, animationFrameId, isGameRunning;

    // --- Image Loading ---
    const playerImage = new Image();
    playerImage.src = 'img/Avokiddo_pixel_no_background.png';
    // Your local path: 'img/Avokiddo_pixel_no_background.png'

    const obstacleImage = new Image();
    obstacleImage.src = 'img/pixel_sausage_no_back-Photoroom.png';
    // Your local path: 'img/pixel_sausage_no_back-Photoroom.png'

    // --- Obstacle Configuration ---
    const obstacleDrawWidth = 80;
    const obstacleDrawHeight = 80;
    const obstacleHitboxWidth = 20;
    const obstacleHitboxHeight = 40;

    /**
     * Resets all game variables to their initial state.
     * This is called every time the game starts.
     */
    function initializeGame() {
        player = {
            x: 50,
            y: canvas.height - 70,
            width: 70,
            height: 70,
            velocityY: 0,
            isJumping: false
        };
        obstacles = [];
        frameCount = 0;
        score = 0;
        isGameRunning = true;
    }

    /**
     * The main game loop that updates and redraws the game.
     */
    function gameLoop() {
        if (!isGameRunning) return; // Stop the loop if the game is over

        // --- Game Logic (Update state) ---
        updateGameState();

        // --- Drawing (Render the new state) ---
        drawGame();

        // Request the next frame
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    /**
     * Handles all game logic updates per frame (player movement, obstacle generation, etc.).
     */
    function updateGameState() {
        // Player physics
        if (player.isJumping) {
            player.velocityY += 1.5; // Gravity
            player.y += player.velocityY;
            if (player.y > canvas.height - player.height) {
                player.y = canvas.height - player.height;
                player.velocityY = 0;
                player.isJumping = false;
            }
        }

        // Generate new obstacles
        frameCount++;
        if (frameCount % 120 === 0) {
            obstacles.push({
                x: canvas.width,
                y: canvas.height - obstacleDrawHeight
            });
        }

        // Move obstacles and check for collision
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].x -= 5; // Move left

            // Remove if off-screen
            if (obstacles[i].x + obstacleDrawWidth < 0) {
                obstacles.splice(i, 1);
                score++;
            }

            // Collision Detection
            const hitbox = { x: obstacles[i].x, y: obstacles[i].y, width: obstacleHitboxWidth, height: obstacleHitboxHeight };
            if (
                player.x < hitbox.x + hitbox.width/2 &&
                player.x + player.width/2 > hitbox.x &&
                player.y < hitbox.y + hitbox.height/2 &&
                player.y + player.height/2 > hitbox.y
            ) {
                endGame(); // End the game on collision
                return;
            }
        }
    }

    /**
     * Handles all drawing operations on the canvas.
     */
    function drawGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Player
        ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);

        // Draw Obstacles
        for (const obs of obstacles) {
            ctx.drawImage(obstacleImage, obs.x, obs.y, obstacleDrawWidth, obstacleDrawHeight);
        }

        // Draw Score
        ctx.fillStyle = '#000';
        ctx.font = '24px Poppins';
        ctx.fillText('Pontuação: ' + score, 10, 30);
    }
    
    /**
     * Handles the player jump action.
     * @param {KeyboardEvent} e - The keyboard event.
     */
    function handleJump(e) {
        if ((e.code === 'Space' || e.code === 'ArrowUp') && !player.isJumping && isGameRunning) {
            player.velocityY = -20;
            player.isJumping = true;
        }
    }

    /**
     * Starts the game by showing the modal and beginning the game loop.
     */
    function startGame() {
        gameModal.classList.remove('hidden');
        initializeGame();
        gameLoop();
        // Add key listener only when the game is active
        document.addEventListener('keydown', handleJump);
    }

    /**
     * Stops the game, hides the modal, and cleans up.
     */
    function stopGame() {
        isGameRunning = false;
        cancelAnimationFrame(animationFrameId);
        gameModal.classList.add('hidden');
        // Remove key listener to prevent jumping when the game is not active
        document.removeEventListener('keydown', handleJump);
    }
    
    /**
     * Displays a "Game Over" message and allows restarting.
     */
    function endGame() {
        isGameRunning = false;
        cancelAnimationFrame(animationFrameId);

        // Display Game Over message
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 40px Poppins';
        ctx.textAlign = 'center';
        ctx.fillText('Fim de Jogo!', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '20px Poppins';
        ctx.fillText('Sua pontuação: ' + score, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('Pressione ESPAÇO para jogar de novo', canvas.width / 2, canvas.height / 2 + 60);
        ctx.textAlign = 'left'; // Reset alignment
    }
    
    // --- Event Listeners ---
    gameLauncher.addEventListener('click', startGame);
    closeGameBtn.addEventListener('click', stopGame);

    // Add a listener to restart the game
    document.addEventListener('keydown', (e) => {
        // Only allow restart if the game is over (not running) and the modal is visible
        if (e.code === 'Space' && !isGameRunning && !gameModal.classList.contains('hidden')) {
            initializeGame();
            gameLoop();
        }
    });

});
