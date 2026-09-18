const startButton = document.getElementById('start-btn');
const scoreLabel = document.getElementById('score');
const livesLabel = document.getElementById('lives');
const timeLabel = document.getElementById('time');
const levelLabel = document.getElementById('level');
const message = document.getElementById('message');
const gameBoard = document.getElementById('game-board');
const player = document.getElementById('player');

const keys = { left: false, right: false };
const bullets = [];
const enemyBullets = [];
const invaders = [];

let score = 0;
let lives = 3;
let timeLeft = 60;
let level = 1;
let gameRunning = false;
let animationFrame = null;
let countdownTimer = null;
let lastShotAt = 0;
let lastInvaderMove = 0;
let invaderDirection = 1;
let playerX = 0;
let highScore = Number(localStorage.getItem('spaceInvadersHighScore')) || 0;

function updateHud() {
  scoreLabel.textContent = String(score);
  livesLabel.textContent = String(lives);
  timeLabel.textContent = String(timeLeft);
  levelLabel.textContent = String(level);
}

function showMessage(text, type = '') {
  message.textContent = text;
  message.className = `message ${type}`.trim();
}

function resetPlayerPosition() {
  const playerWidth = player.offsetWidth || 92;
  playerX = (gameBoard.clientWidth - playerWidth) / 2;
  player.style.left = `${playerX}px`;
}

function clearEntities() {
  bullets.forEach((bullet) => bullet.element.remove());
  enemyBullets.forEach((bullet) => bullet.element.remove());
  invaders.forEach((invader) => invader.element.remove());

  bullets.length = 0;
  enemyBullets.length = 0;
  invaders.length = 0;
}

function createInvader(x, y, size, row, col) {
  const invader = document.createElement('div');
  invader.className = 'invader';
  invader.style.width = `${size}px`;
  invader.style.height = `${size}px`;
  invader.style.left = `${x}px`;
  invader.style.top = `${y}px`;
  gameBoard.appendChild(invader);

  return {
    element: invader,
    x,
    y,
    width: size,
    height: size,
    row,
    col,
    alive: true,
  };
}

function createWave() {
  clearEntities();

  const rows = 5;
  const cols = 10;
  const gap = 12;
  const size = 24;
  const startX = 40;
  const startY = 24;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = startX + col * (size + gap);
      const y = startY + row * (size + gap);
      invaders.push(createInvader(x, y, size, row, col));
    }
  }

  invaderDirection = 1;
  lastInvaderMove = 0;
}

function shoot() {
  if (!gameRunning) return;

  const now = Date.now();
  if (now - lastShotAt < 200) return;
  lastShotAt = now;

  const bulletWidth = 6;
  const bulletHeight = 16;
  const bullet = document.createElement('div');
  bullet.className = 'player-bullet';

  const bulletX = playerX + (player.offsetWidth || 92) / 2 - bulletWidth / 2;
  const bulletY = gameBoard.clientHeight - 56;

  bullet.style.left = `${bulletX}px`;
  bullet.style.top = `${bulletY}px`;
  gameBoard.appendChild(bullet);

  bullets.push({
    element: bullet,
    x: bulletX,
    y: bulletY,
    width: bulletWidth,
    height: bulletHeight,
    speed: 440,
  });
}

function enemyShoot() {
  if (!gameRunning || invaders.length === 0) return;

  const shooters = invaders.filter((invader) => invader.alive);
  if (shooters.length === 0) return;

  const shooter = shooters.reduce((lowest, current) => {
    if (!lowest || current.y > lowest.y) return current;
    return lowest;
  }, null);

  if (!shooter) return;

  const bullet = document.createElement('div');
  bullet.className = 'enemy-bullet';
  const bulletX = shooter.x + shooter.width / 2 - 3;
  const bulletY = shooter.y + shooter.height + 8;

  bullet.style.left = `${bulletX}px`;
  bullet.style.top = `${bulletY}px`;
  gameBoard.appendChild(bullet);

  enemyBullets.push({
    element: bullet,
    x: bulletX,
    y: bulletY,
    width: 6,
    height: 16,
    speed: 260,
  });
}

function removeBullet(index, array) {
  const bullet = array[index];
  if (!bullet) return;
  bullet.element.remove();
  array.splice(index, 1);
}

function removeInvader(index) {
  const invader = invaders[index];
  if (!invader) return;
  invader.alive = false;
  invader.element.remove();
  invaders.splice(index, 1);
}

function intersects(a, b) {
  return !(
    a.x + a.width <= b.x ||
    a.x >= b.x + b.width ||
    a.y + a.height <= b.y ||
    a.y >= b.y + b.height
  );
}

function endGame() {
  gameRunning = false;
  clearInterval(countdownTimer);
  cancelAnimationFrame(animationFrame);

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('spaceInvadersHighScore', String(highScore));
  }

  showMessage(`Mission failed. Final score: ${score}. Best: ${highScore}. Press Start to try again.`, 'bad');
}

function advanceInvaders() {
  if (!gameRunning || invaders.length === 0) return;

  let moveX = invaderDirection * 18;
  let moveY = 0;

  for (const invader of invaders) {
    const nextX = invader.x + moveX;
    if (nextX <= 8 || nextX + invader.width >= gameBoard.clientWidth - 8) {
      moveX = 0;
      moveY = 18;
      invaderDirection *= -1;
      break;
    }
  }

  for (const invader of invaders) {
    invader.x += moveX;
    invader.y += moveY;
    invader.element.style.left = `${invader.x}px`;
    invader.element.style.top = `${invader.y}px`;
  }

  const lowestInvader = Math.max(...invaders.map((invader) => invader.y + invader.height));
  if (lowestInvader >= gameBoard.clientHeight - 44) {
    endGame();
  }
}

function handlePlayerBullets() {
  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    const bullet = bullets[i];
    bullet.y -= bullet.speed / 60;
    bullet.element.style.top = `${bullet.y}px`;

    if (bullet.y + bullet.height < 0) {
      removeBullet(i, bullets);
      continue;
    }

    for (let j = invaders.length - 1; j >= 0; j -= 1) {
      const invader = invaders[j];
      if (!invader.alive) continue;

      if (intersects(bullet, invader)) {
        removeBullet(i, bullets);
        removeInvader(j);
        score += 10;
        updateHud();
        showMessage('Target destroyed!', 'good');
        break;
      }
    }
  }
}

function handleEnemyBullets() {
  for (let i = enemyBullets.length - 1; i >= 0; i -= 1) {
    const bullet = enemyBullets[i];
    bullet.y += bullet.speed / 60;
    bullet.element.style.top = `${bullet.y}px`;

    if (bullet.y > gameBoard.clientHeight) {
      removeBullet(i, enemyBullets);
      continue;
    }

    const playerRect = {
      x: playerX,
      y: gameBoard.clientHeight - 36,
      width: player.offsetWidth || 92,
      height: 24,
    };

    if (intersects(bullet, playerRect)) {
      removeBullet(i, enemyBullets);
      lives -= 1;
      updateHud();
      showMessage('Direct hit! Keep moving!', 'bad');

      if (lives <= 0) {
        endGame();
        return;
      }
    }
  }
}

function tickGame(timeStamp) {
  if (!gameRunning) return;

  const delta = (timeStamp - (tickGame.lastTime || timeStamp)) / 1000;
  tickGame.lastTime = timeStamp;

  if (keys.left) {
    playerX -= 280 * delta;
  }

  if (keys.right) {
    playerX += 280 * delta;
  }

  const maxX = gameBoard.clientWidth - (player.offsetWidth || 92);
  playerX = Math.max(0, Math.min(playerX, maxX));
  player.style.left = `${playerX}px`;

  if (timeStamp - lastInvaderMove > Math.max(180, 700 - level * 40)) {
    lastInvaderMove = timeStamp;
    advanceInvaders();

    if (Math.random() < 0.2 + level * 0.04) {
      enemyShoot();
    }
  }

  handlePlayerBullets();
  handleEnemyBullets();

  if (invaders.length === 0) {
    level += 1;
    updateHud();
    showMessage(`Wave cleared! Level ${level}!`, 'good');
    createWave();
    score += 50;
    updateHud();
  }

  animationFrame = requestAnimationFrame(tickGame);
}

function tickClock() {
  if (!gameRunning) return;

  timeLeft -= 1;
  updateHud();

  if (timeLeft <= 0) {
    endGame();
  }
}

function startGame() {
  score = 0;
  lives = 3;
  timeLeft = 60;
  level = 1;
  gameRunning = true;
  resetPlayerPosition();
  updateHud();
  showMessage('Defend Earth! Enemy fleet incoming!', 'good');

  clearEntities();
  createWave();

  clearInterval(countdownTimer);
  cancelAnimationFrame(animationFrame);

  countdownTimer = setInterval(tickClock, 1000);
  animationFrame = requestAnimationFrame(tickGame);
}

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();

  if (event.key === 'ArrowLeft' || key === 'a') {
    keys.left = true;
  }

  if (event.key === 'ArrowRight' || key === 'd') {
    keys.right = true;
  }

  if (event.code === 'Space') {
    event.preventDefault();
    shoot();
  }
});

window.addEventListener('keyup', (event) => {
  const key = event.key.toLowerCase();

  if (event.key === 'ArrowLeft' || key === 'a') {
    keys.left = false;
  }

  if (event.key === 'ArrowRight' || key === 'd') {
    keys.right = false;
  }
});

gameBoard.addEventListener('pointerdown', () => {
  shoot();
});

startButton.addEventListener('click', startGame);

resetPlayerPosition();
updateHud();
showMessage('Press Start to defend Earth.', 'warn');
