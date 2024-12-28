// Constants
const BALL_COLOR = '#FFF';
const PADDLE_COLOR = '#0095dd';
const BRICK_COLOR = '#0095dd';
const SCORE_FONT = '20px Arial';
const SCORE_COLOR = '#0095dd';
const MESSAGE_FONT = '40px Arial';

// DOM Elements
const rulesBtn = document.getElementById('rules-btn');
const closeBtn = document.getElementById('close-btn');
const rules = document.getElementById('rules');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restart-btn');

let score = 0;
let lives = 3;
let gameState = 'start'; // 'start', 'playing', 'paused', 'over'
let highestScore = localStorage.getItem('highestScore') || 0;

const tournesolImg = document.getElementById('tournesol');
const herbeImg = document.getElementById('herbe');

const brickRowCount = 12;
const brickColumnCount = 7;

function randomImage() {
  return document.getElementById(`cigarette${Math.round(Math.random() * 3)}`);
}

// Ball properties
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  // size: 10,
  size: 20,
  speed: 4,
  dx: 4,
  dy: -4,
  color: BALL_COLOR,
};

// Paddle properties
const paddle = {
  x: canvas.width / 2 - 40,
  y: canvas.height - 20,
  w: 80,
  h: 20,
  speed: 8,
  dx: 0,
  color: PADDLE_COLOR,
};

// Brick properties
const brickInfo = {
  w: 70,
  h: 40,
  padding: 10,
  offsetX: 45,
  offsetY: 60,
  visible: true,
  color: BRICK_COLOR,
  img: 'cigarette0',
};

const bricks = createBricks();

function createBricks() {
  let arr = [];
  for (let i = 0; i < brickRowCount; i++) {
    arr[i] = [];
    for (let j = 0; j < brickColumnCount; j++) {
      const x = i * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
      const y = j * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
      arr[i][j] = { x, y, ...brickInfo, img: randomImage() };
    }
  }
  return arr;
}

// Drawing functions
// Draw ball on canvas
function drawBall() {
  ctx.drawImage(tournesolImg, 0, 0, 40, 39, ball.x - 20, ball.y - 20, 40, 39);
}

// Draw paddle on canvas
function drawPaddle() {
  ctx.drawImage(herbe, 0, 0, 80, 40, paddle.x, paddle.y - 20, 80, 40);
}

// Draw score oon canvas
function drawScore() {
  ctx.textAlign = 'right';
  ctx.font = '20px Arial';
  ctx.fillText(`Nombre de cigarettes atomisées : ${score}`, canvas.width - 10, 30);
}

// Draw bricks on canvas
function drawBricks() {
  bricks.forEach((column) => {
    column.forEach((brick) => {
      if (brick.visible) {
        ctx.drawImage(brick.img, brick.x, brick.y);
      }
    });
  });
}

// Movement functions
// Move paddle on canvas
function movePaddle() {
  paddle.x += paddle.dx;

  // Wall detection
  if (paddle.x + paddle.w > canvas.width) {
    paddle.x = canvas.width - paddle.w;
  }

  if (paddle.x < 0) {
    paddle.x = 0;
  }
}

// Move ball on canvas
function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collision (right/left)
  if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) {
    ball.dx *= -1; // ball.dx = ball.dx * -1
  }

  // Wall collision (top/bottom)
  if (ball.y + ball.size > canvas.height || ball.y - ball.size < 0) {
    ball.dy *= -1;
  }

  // Paddle collision
  if (
    ball.x - ball.size > paddle.x &&
    ball.x + ball.size < paddle.x + paddle.w &&
    ball.y + ball.size > paddle.y
  ) {
    ball.dy = -ball.speed;
  }

  // Brick collision
  bricks.forEach((column) => {
    column.forEach((brick) => {
      if (brick.visible) {
        if (
          ball.x - ball.size > brick.x && // left brick side check
          ball.x + ball.size < brick.x + brick.w && // right brick side check
          ball.y + ball.size > brick.y && // top brick side check
          ball.y - ball.size < brick.y + brick.h // bottom brick side check
        ) {
          ball.dy *= -1;
          brick.visible = false;

          increaseScore();
        }
      }
    });
  });

  // Hit bottom wall - Lose
  if (ball.y + ball.size > canvas.height) {
    lives--;
    if (lives <= 0) {
      gameState = 'over';
      if (score > highestScore) {
        localStorage.setItem('highestScore', score);
        highestScore = score;
      }
    } else {
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
      ball.dy *= -1;
    }
  }
}

// Game logic functions
// Increase score
function increaseScore() {
  score++;

  if (score % (brickRowCount * brickRowCount) === 0) {
    showAllBricks();
  }
}

// Make all bricks appear
function showAllBricks() {
  bricks.forEach((column) => {
    column.forEach((brick) => (brick.visible = true));
  });
}

// Update canvas drawing and animation
function update() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(109, 167, 204, 0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#FFF'; // Set text color
  if (gameState === 'start') {
    ctx.font = MESSAGE_FONT;
    ctx.textAlign = 'center';
    ctx.fillText(
      "Appuyez sur la barre d'espace pour démarrer !",
      canvas.width / 2,
      canvas.height / 2
    );
  } else if (gameState === 'playing') {
    drawBall();
    drawPaddle();
    drawScore();
    drawBricks();

    movePaddle();
    moveBall();

    ctx.textAlign = 'left';
    ctx.fillText(`Vies: ${lives}`, 10, 30);
  } else if (gameState === 'paused') {
    ctx.textAlign = 'center';
    ctx.font = MESSAGE_FONT;
    ctx.fillText('En pause', canvas.width / 2, canvas.height / 2);
  } else if (gameState === 'over') {
    ctx.font = MESSAGE_FONT;
    ctx.textAlign = 'center';
    ctx.fillText('Jeu terminé !', canvas.width / 2, canvas.height / 2 - 40);
    ctx.fillText(`Nombre de cigarettes atomisées : ${score}`, canvas.width / 2, canvas.height / 2);
    ctx.fillText(
      `Votre score le plus haut : ${highestScore}`,
      canvas.width / 2,
      canvas.height / 2 + 40
    );
    restartBtn.style.display = 'block';
  }

  requestAnimationFrame(update);
}

// Restart game
function restartGame() {
  // Hide the restart button
  restartBtn.style.display = 'none';

  // Reset the game state, score, and other game variables
  gameState = 'start';
  score = 0;
  lives = 3;

  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = 4;
  ball.dy = -4;

  paddle.x = canvas.width / 2 - 40;
  paddle.y = canvas.height - 20;
  paddle.dx = 0;

  showAllBricks();
}

// Event handlers
// Keydown event
function keyDown(e) {
  if (e.key === 'Right' || e.key === 'ArrowRight') {
    paddle.dx = paddle.speed;
  } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
    paddle.dx = -paddle.speed;
  }

  // Handle start, pause and resume with Spacebar
  if (e.key === ' ') {
    if (gameState === 'start') {
      gameState = 'playing';
    } else if (gameState === 'playing') {
      gameState = 'paused';
    } else if (gameState === 'paused') {
      gameState = 'playing';
    } else if (gameState === 'over') {
      restartGame();
    }
  }
}

// Keyup event
function keyUp(e) {
  if (
    e.key === 'Right' ||
    e.key === 'ArrowRight' ||
    e.key === 'Left' ||
    e.key === 'ArrowLeft'
  ) {
    paddle.dx = 0;
  }
}

// Register event listeners
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
rulesBtn.addEventListener('click', () => rules.classList.add('show'));
closeBtn.addEventListener('click', () => rules.classList.remove('show'));
restartBtn.addEventListener('click', restartGame);

// Start the game
update();
