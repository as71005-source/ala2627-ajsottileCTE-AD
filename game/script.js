const startButton = document.getElementById('start-btn');
const scoreLabel = document.getElementById('score');
const livesLabel = document.getElementById('lives');
const timeLabel = document.getElementById('time');
const levelLabel = document.getElementById('level');
const message = document.getElementById('message');
const gameBoard = document.getElementById('game-board');
const player = document.getElementById('player');

let score = 0;
let lives = 3;
let timeLeft = 60;
let level = 1;
let gameRunning = false;
let animationFrame = null;
let countdownTimer = null;
let lastShotAt = 0;
let lastInvaderStep = 0;
let invaderDirection = 1;
let highScore = Number(localStorage.getItem('spaceInvadersHighScore')) || 0;

const bullets = [];
const enemyBullets = [];
const invaders = [];
const keys = { left: false, right: false };
const playerSpeed = 8;
let playerX = gameBoard.clientWidth / 2 - 46;

function updateHud() {
  scoreLabel.textContent = score;
  livesLabel.textContent = lives;
  timeLabel.textContent = timeLeft;
  levelLabel.textContent = level;
}

function showMessage(text, type = '') {
  message.textContent = text;
  message.className = `message ${type}`.trim();
}

function resetPlayerPosition() {
  playerX = gameBoard.clientWidth / 2 - 46;
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

function makeInvader(x, y, size, row) {
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
    alive: true,
  };
}

function createInvaderWave() {
  clearEntities();

  const rows = 4;
  const cols = 10;
  const gap = 12;
  const size = 24;
  const startX = 60;
  const startY = 30;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = startX + col * (size + gap);
      const y = startY + row * (size + gap);
      invaders.push(makeInvader(x, y, size, row));
    }
  }

  invaderDirection = 1;
  lastInvaderStep = 0;
}

function shoot() {
  if (!gameRunning) return;

  const now = Date.now();
  if (now - lastShotAt < 180) return;
  lastShotAt = now;

  const bullet = document.createElement('div');
  bullet.className = 'player-bullet';
  const bulletX = playerX + 42;
  const bulletY = gameBoard.clientHeight - 50;
  bullet.style.left = `${bulletX}px`;
  bullet.style.top = `${bulletY}px`;
  gameBoard.appendChild(bullet);

  bullets.push({
    element: bullet,
    x: bulletX,
    y: bulletY,
    width: 6,
    height: 16,
    speed: 10,
  });
}

function enemyShoot() {
  if (!gameRunning || invaders.length === 0) return;

  const livingInvaders = invaders.filter((invader) => invader.alive);
  if (livingInvaders.length === 0) return;

  const shooters = livingInvaders.filter((invader) => invader.row === Math.max(...livingInvaders.map((item) => item.row)));
  const shooter = shooters[Math.floor(Math.random() * shooters.length)];
  if (!shooter) return;

  const bullet = document.createElement('div');
  bullet.className = 'enemy-bullet';
  const bulletX = shooter.x + shooter.width / 2;
  const bulletY = shooter.y + shooter.height + 10;
  bullet.style.left = `${bulletX}px`;
  bullet.style.top = `${bulletY}px`;
  gameBoard.appendChild(bullet);

  enemyBullets.push({
    element: bullet,
    x: bulletX,
    y: bulletY,
    width: 6,
    height: 16,
    speed: 7,
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

function checkCollision(a, b) {
  return !(
    a.x + a.width < b.x ||
    a.x > b.x + b.width ||
    a.y + a.height < b.y ||
    a.y > b.y + b.height
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

  let moveX = 0;
  let moveY = 0;
  let edgeHit = false;

  for (const invader of invaders) {
    const nextX = invader.x + invaderDirection * 18;
    if (nextX <= 0 || nextX + invader.width >= gameBoard.clientWidth) {
      edgeHit = true;
    }
  }

  if (edgeHit) {
    invaderDirection *= -1;
    moveY = 18;
  } else {
    moveX = invaderDirection * 18;
  }

  for (const invader of invaders) {
    invader.x += moveX;
    invader.y += moveY;
    invader.element.style.left = `${invader.x}px`;
    invader.element.style.top = `${invader.y}px`;
  }

  const lowestInvader = Math.max(...invaders.map((invader) => invader.y + invader.height));
  if (lowestInvader >= gameBoard.clientHeight - 52) {
    endGame();
  }
}

function handlePlayerShotCollisions() {
  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    const bullet = bullets[i];
    for (let j = invaders.length - 1; j >= 0; j -= 1) {
      const invader = invaders[j];
      if (checkCollision(bullet, invader)) {
        removeBullet(i, bullets);
        removeInvader(j);
        score += 10;
        updateHud();
        showMessage('Target destroyed!', 'good');
        return;
      }
    }
  }
}

function handleEnemyShots() {
  for (let i = enemyBullets.length - 1; i >= 0; i -= 1) {
    const bullet = enemyBullets[i];
    bullet.y += bullet.speed;
    bullet.element.style.top = `${bullet.y}px`;

    if (bullet.y > gameBoard.clientHeight) {
      removeBullet(i, enemyBullets);
      continue;
    }

    const playerRect = {
      x: playerX + 18,
      y: gameBoard.clientHeight - 36,
      width: 58,
      height: 24,
    };

    if (checkCollision(bullet, playerRect)) {
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

function tickGame() {
  if (!gameRunning) return;

  if (keys.left) {
    playerX -= playerSpeed;
  }

  if (keys.right) {
    playerX += playerSpeed;
  }

  const maxX = gameBoard.clientWidth - 92;
  playerX = Math.max(0, Math.min(playerX, maxX));
  player.style.left = `${playerX}px`;

  const now = Date.now();
  if (now - lastInvaderStep > Math.max(220, 700 - level * 40)) {
    lastInvaderStep = now;
    advanceInvaders();
    if (Math.random() < 0.25 + level * 0.03) {
      enemyShoot();
    }
  }

  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    const bullet = bullets[i];
    bullet.y -= bullet.speed;
    bullet.element.style.top = `${bullet.y}px`;

    if (bullet.y < -20) {
      removeBullet(i, bullets);
    }
  }

  handleEnemyShots();
  handlePlayerShotCollisions();

  if (invaders.length === 0) {
    level += 1;
    updateHud();
    showMessage(`Wave cleared! Level ${level}!`, 'good');
    createInvaderWave();
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
  createInvaderWave();

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
