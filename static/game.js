const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 400;

let paddleX = 250;
const paddleWidth = 100;
const paddleHeight = 10;
const ballSize = 10;

let ballX, ballY, ballSpeedX, ballSpeedY, score;
let gameOver = false;

function resetGame() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = 2;  // Reduced speed
    ballSpeedY = 2;  // Reduced speed
    score = 0;
    gameOver = false;
}

resetGame(); // Start game with initial values

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Paddle
    ctx.fillStyle = "blue";
    ctx.fillRect(paddleX, canvas.height - 20, paddleWidth, paddleHeight);

    // Draw Ball
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
    ctx.fill();

    // Draw Score
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 20, 30);

    // Draw Restart Button
    ctx.fillStyle = "green";
    ctx.fillRect(canvas.width / 2 - 50, 20, 100, 30);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("Restart", canvas.width / 2 - 25, 40);
}

function update() {
    if (gameOver) return;

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Ball collision with walls
    if (ballX <= 0 || ballX >= canvas.width) ballSpeedX *= -1;
    if (ballY <= 0) ballSpeedY *= -1;

    // Ball collision with paddle
    if (ballY + ballSize >= canvas.height - 20 &&
        ballX >= paddleX && ballX <= paddleX + paddleWidth) {
        ballSpeedY *= -1;
        score++;
    }

    // Game Over condition
    if (ballY > canvas.height) {
        gameOver = true;
    }

    draw();
}

function movePaddle() {
    fetch('/get_paddle_position')
        .then(response => response.json())
        .then(data => {
            paddleX = Math.max(0, Math.min(canvas.width - paddleWidth, data.paddle_x - paddleWidth / 2));
        });
}

function gameLoop() {
    movePaddle();
    update();
    requestAnimationFrame(gameLoop);
}

// Handle mouse click for restart button
canvas.addEventListener("click", function (event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (mouseX >= canvas.width / 2 - 50 && mouseX <= canvas.width / 2 + 50 &&
        mouseY >= 20 && mouseY <= 50) {
        resetGame();
    }
});

gameLoop();
