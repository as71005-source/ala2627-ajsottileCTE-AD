const startButton = document.getElementById('start-btn');
const playerScoreLabel = document.getElementById('player-score');
const cpuScoreLabel = document.getElementById('cpu-score');
const roundLabel = document.getElementById('round');
const statusLabel = document.getElementById('status');
const message = document.getElementById('message');
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');

const paddleHeight = 110;
const paddleWidth = 14;
const ballRadius = 10;

const leftPaddle = { x: 26, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, score: 0 };
const rightPaddle = { x: canvas.width - 26 - paddleWidth, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, score: 0 };

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: ballRadius,
  dx: 5,
  dy: 4,
  speed: 6,
};

let round = 1;
let running = false;
let lastTime = 0;
let pointerY = canvas.height / 2;

function updateHud() {
  playerScoreLabel.textContent = String(leftPaddle.score);
  cpuScoreLabel.textContent = String(rightPaddle.score);
  roundLabel.textContent = String(round);
  statusLabel.textContent = running ? 'Live' : 'Ready';
}

function showMessage(text, type = '') {
  message.textContent = text;
  message.className = `message ${type}`.trim();
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  const direction = Math.random() > 0.5 ? 1 : -1;
  ball.dx = direction * (ball.speed + Math.random() * 1.5);
  ball.dy = (Math.random() * 6 - 3);
}

function resetRound() {
  leftPaddle.y = canvas.height / 2 - paddleHeight / 2;
  rightPaddle.y = canvas.height / 2 - paddleHeight / 2;
  pointerY = leftPaddle.y + paddleHeight / 2;
  resetBall();
  updateHud();
}

function startGame() {
  leftPaddle.score = 0;
  rightPaddle.score = 0;
  round = 1;
  running = true;
  resetRound();
  showMessage('Portal Category match live!', 'good');
  updateHud();
}

function handlePaddleMovement() {
  leftPaddle.y = pointerY - paddleHeight / 2;
  leftPaddle.y = Math.max(10, Math.min(canvas.height - paddleHeight - 10, leftPaddle.y));

  const cpuTarget = ball.y - rightPaddle.height / 2;
  rightPaddle.y += (cpuTarget - rightPaddle.y) * 0.09;
  rightPaddle.y = Math.max(10, Math.min(canvas.height - rightPaddle.height - 10, rightPaddle.y));
}

function checkCollision() {
  if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
    ball.dy *= -1;
  }

  if (ball.x - ball.radius <= leftPaddle.x + leftPaddle.width && ball.y >= leftPaddle.y && ball.y <= leftPaddle.y + leftPaddle.height && ball.x > leftPaddle.x) {
    const hitPoint = (ball.y - (leftPaddle.y + leftPaddle.height / 2)) / (leftPaddle.height / 2);
    ball.dx = Math.abs(ball.dx) + 0.6;
    ball.dy = hitPoint * 8;
    ball.x = leftPaddle.x + leftPaddle.width + ball.radius;
  }

  if (ball.x + ball.radius >= rightPaddle.x && ball.y >= rightPaddle.y && ball.y <= rightPaddle.y + rightPaddle.height && ball.x < rightPaddle.x + rightPaddle.width) {
    const hitPoint = (ball.y - (rightPaddle.y + rightPaddle.height / 2)) / (rightPaddle.height / 2);
    ball.dx = -Math.abs(ball.dx) - 0.6;
    ball.dy = hitPoint * 8;
    ball.x = rightPaddle.x - ball.radius;
  }
}

function scorePoint() {
  if (ball.x < 0) {
    rightPaddle.score += 1;
    showMessage('CPU scores!', 'bad');
  }

  if (ball.x > canvas.width) {
    leftPaddle.score += 1;
    showMessage('Player scores!', 'good');
  }

  updateHud();
  resetBall();

  if (leftPaddle.score >= 7 || rightPaddle.score >= 7) {
    running = false;
    round += 1;
    showMessage(leftPaddle.score > rightPaddle.score ? 'You win the portal match!' : 'CPU wins this round.', 'good');
    updateHud();
  }
}

function updateBall() {
  if (!running) return;

  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x < 0 || ball.x > canvas.width) {
    scorePoint();
  }

  checkCollision();
}

function drawCenterLine() {
  ctx.beginPath();
  ctx.setLineDash([10, 12]);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPaddle(paddle, color) {
  ctx.fillStyle = color;
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.beginPath();
  ctx.fillStyle = '#facc15';
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawPortalText() {
  ctx.fillStyle = 'rgba(103, 232, 249, 0.26)';
  ctx.font = 'bold 42px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Portal Category', canvas.width / 2, 54);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#071a2b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawCenterLine();
  drawPortalText();
  drawPaddle(leftPaddle, '#67e8f9');
  drawPaddle(rightPaddle, '#a78bfa');
  drawBall();
}

function gameLoop(timestamp) {
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  if (running) {
    handlePaddleMovement();
    updateBall();
  }

  render();
  requestAnimationFrame(gameLoop);
}

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseY = ((event.clientY - rect.top) / rect.height) * canvas.height;
  pointerY = mouseY;
});

startButton.addEventListener('click', () => {
  startGame();
});

updateHud();
showMessage('Press Start to launch the match.', 'warn');
resetRound();
render();
requestAnimationFrame(gameLoop);
