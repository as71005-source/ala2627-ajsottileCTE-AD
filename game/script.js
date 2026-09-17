const startButton = document.getElementById('start-btn');
const scoreLabel = document.getElementById('score');
const timeLabel = document.getElementById('time');
const message = document.getElementById('message');
const gameBoard = document.getElementById('game-board');
const target = document.getElementById('target');

let score = 0;
let timeLeft = 15;
let timerId = null;
let targetTimerId = null;
let gameRunning = false;

function updateScore() {
  scoreLabel.textContent = score;
}

function updateTime() {
  timeLabel.textContent = timeLeft;
}

function showMessage(text, type = '') {
  message.textContent = text;
  message.className = `message ${type}`.trim();
}

function moveTarget() {
  if (!gameRunning) return;

  const boardWidth = gameBoard.clientWidth - 62;
  const boardHeight = gameBoard.clientHeight - 62;
  const x = Math.random() * boardWidth;
  const y = Math.random() * boardHeight;

  target.style.left = `${x}px`;
  target.style.top = `${y}px`;
  target.style.display = 'block';
}

function endGame() {
  gameRunning = false;
  clearInterval(timerId);
  clearInterval(targetTimerId);
  target.style.display = 'none';
  showMessage(`Time's up! Final score: ${score}. Hit Start to play again.`, 'bad');
}

function tick() {
  timeLeft -= 1;
  updateTime();

  if (timeLeft <= 0) {
    endGame();
  }
}

function startGame() {
  score = 0;
  timeLeft = 15;
  updateScore();
  updateTime();
  gameRunning = true;
  showMessage('Catch the glowing treasure!', 'good');

  moveTarget();

  clearInterval(timerId);
  clearInterval(targetTimerId);
  timerId = setInterval(tick, 1000);
  targetTimerId = setInterval(moveTarget, 650);
}

target.addEventListener('click', () => {
  if (!gameRunning) return;

  score += 1;
  updateScore();
  showMessage('Nice! Keep tapping the treasure!', 'good');
  moveTarget();
});

startButton.addEventListener('click', startGame);

updateScore();
updateTime();
showMessage('Press Start to begin.');
