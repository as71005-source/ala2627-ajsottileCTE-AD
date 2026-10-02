document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.memory-card')) initMemoryMatch();
  if (document.querySelector('.rps-btn')) initRockPaperScissors();
  if (document.getElementById('guess-form')) initGuessGame();
  if (document.getElementById('reaction-box')) initReactionTest();
  if (document.querySelector('.ttt-cell')) initTicTacToe();
  if (document.querySelector('.mole-hole')) initWhackMole();
  if (document.getElementById('snake-board')) initSnake();
  if (document.getElementById('color-field')) initColorCatch();
  if (document.getElementById('typing-input')) initTypingRush();
  if (document.getElementById('pong-board')) initPong();
});

function initMemoryMatch() {
  const cards = [...document.querySelectorAll('.memory-card')];
  if (!cards.length) return;
  const scoreEl = document.getElementById('memory-score');
  if (!scoreEl) return;
  const resetButton = document.querySelector('[data-reset="memory"]');
  if (!resetButton) return;
  const icons = ['🍒', '🍋', '🍇', '🍉', '🍎', '🍊'];

  let deck = [...icons, ...icons].sort(() => Math.random() - 0.5);
  let openCards = [];
  let matchedPairs = 0;
  let score = 0;

  function updateScore() {
    scoreEl.textContent = String(score);
  }

  function resetBoard() {
    deck = [...icons, ...icons].sort(() => Math.random() - 0.5);
    openCards = [];
    matchedPairs = 0;
    score = 0;
    cards.forEach((card, index) => {
      card.textContent = '?';
      card.disabled = false;
      card.classList.remove('revealed');
      card.dataset.value = deck[index];
    });
    updateScore();
  }

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      if (card.disabled || openCards.length >= 2) return;
      const value = card.dataset.value;
      card.textContent = value;
      card.classList.add('revealed');
      openCards.push({ card, value });

      if (openCards.length === 2) {
        const [first, second] = openCards;
        if (first.value === second.value) {
          matchedPairs += 1;
          score += 1;
          updateScore();
          first.card.disabled = true;
          second.card.disabled = true;
          openCards = [];

          if (matchedPairs === icons.length) {
            scoreEl.textContent = `Win! ${score}`;
          }
        } else {
          setTimeout(() => {
            first.card.textContent = '?';
            second.card.textContent = '?';
            first.card.classList.remove('revealed');
            second.card.classList.remove('revealed');
            openCards = [];
          }, 500);
        }
      }
    });
  });

  resetButton.addEventListener('click', resetBoard);
  resetBoard();
}

function initRockPaperScissors() {
  const buttons = [...document.querySelectorAll('.rps-btn')];
  if (!buttons.length) return;
  const resultEl = document.getElementById('rps-result');
  const scoreEl = document.getElementById('rps-score');
  if (!resultEl || !scoreEl) return;
  const resetButton = document.querySelector('[data-reset="rps"]');
  if (!resetButton) return;

  const choices = ['rock', 'paper', 'scissors'];
  let score = 0;

  function updateScore() {
    scoreEl.textContent = String(score);
  }

  function getOutcome(player, cpu) {
    if (player === cpu) return 'draw';
    if ((player === 'rock' && cpu === 'scissors') || (player === 'paper' && cpu === 'rock') || (player === 'scissors' && cpu === 'paper')) {
      return 'win';
    }
    return 'lose';
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const player = button.dataset.choice;
      const cpu = choices[Math.floor(Math.random() * choices.length)];
      const outcome = getOutcome(player, cpu);

      if (outcome === 'win') {
        score += 1;
        resultEl.textContent = `You win! ${player} beats ${cpu}.`;
      } else if (outcome === 'lose') {
        resultEl.textContent = `You lose. ${cpu} beats ${player}.`;
      } else {
        resultEl.textContent = `Draw! Both picked ${player}.`;
      }

      updateScore();
    });
  });

  resetButton.addEventListener('click', () => {
    score = 0;
    resultEl.textContent = 'Pick one to play.';
    updateScore();
  });

  updateScore();
}

function initGuessGame() {
  const form = document.getElementById('guess-form');
  if (!form) return;
  const input = document.getElementById('guess-input');
  const resultEl = document.getElementById('guess-result');
  const scoreEl = document.getElementById('guess-score');
  if (!input || !resultEl || !scoreEl) return;
  const resetButton = document.querySelector('[data-reset="guess"]');
  if (!resetButton) return;

  let target = Math.floor(Math.random() * 20) + 1;
  let score = 0;

  function updateScore() {
    scoreEl.textContent = String(score);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const guess = Number(input.value);

    if (!guess || guess < 1 || guess > 20) {
      resultEl.textContent = 'Choose a number from 1 to 20.';
      return;
    }

    if (guess === target) {
      score += 1;
      resultEl.textContent = `Correct! ${guess} was the number.`;
      target = Math.floor(Math.random() * 20) + 1;
    } else if (guess < target) {
      resultEl.textContent = 'Too low. Try again.';
    } else {
      resultEl.textContent = 'Too high. Try again.';
    }

    input.value = '';
    input.focus();
    updateScore();
  });

  resetButton.addEventListener('click', () => {
    score = 0;
    target = Math.floor(Math.random() * 20) + 1;
    resultEl.textContent = 'Try to find the secret number.';
    input.value = '';
    updateScore();
  });

  updateScore();
}

function initReactionTest() {
  const box = document.getElementById('reaction-box');
  if (!box) return;
  const resultEl = document.getElementById('reaction-result');
  if (!resultEl) return;
  let waiting = false;
  let startTime = 0;
  let timeoutId = null;

  function startRound() {
    waiting = true;
    box.classList.remove('ready');
    box.textContent = 'Wait...';
    resultEl.textContent = 'Wait for green.';

    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      waiting = false;
      startTime = performance.now();
      box.classList.add('ready');
      box.textContent = 'CLICK!';
      resultEl.textContent = 'Now!';
    }, 1000 + Math.random() * 2000);
  }

  box.addEventListener('click', () => {
    if (!waiting && box.classList.contains('ready')) {
      const reactionTime = Math.round(performance.now() - startTime);
      resultEl.textContent = `Your reaction time: ${reactionTime}ms`;
      box.classList.remove('ready');
      box.textContent = 'Start';
      waiting = true;
      return;
    }

    if (waiting && !box.classList.contains('ready')) {
      clearTimeout(timeoutId);
      resultEl.textContent = 'Too soon! Try again.';
      box.textContent = 'Start';
      waiting = false;
      return;
    }

    startRound();
  });
}

function initTicTacToe() {
  const cells = [...document.querySelectorAll('.ttt-cell')];
  if (!cells.length) return;
  const resultEl = document.getElementById('ttt-result');
  if (!resultEl) return;
  const resetButton = document.querySelector('[data-reset="ttt"]');
  if (!resetButton) return;
  const winningPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  let board = Array(9).fill('');
  let currentPlayer = 'X';
  let gameOver = false;

  function updateBoard() {
    cells.forEach((cell, index) => {
      cell.textContent = board[index] || '';
      cell.disabled = board[index] !== '' || gameOver;
    });
  }

  function checkWinner() {
    for (const pattern of winningPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    if (board.every((square) => square !== '')) {
      return 'draw';
    }

    return null;
  }

  function resetGame() {
    board = Array(9).fill('');
    currentPlayer = 'X';
    gameOver = false;
    resultEl.textContent = 'Player X starts.';
    updateBoard();
  }

  cells.forEach((cell) => {
    cell.addEventListener('click', () => {
      if (gameOver || board[cell.dataset.index] !== '') return;

      board[cell.dataset.index] = currentPlayer;
      const winner = checkWinner();

      if (winner) {
        gameOver = true;
        if (winner === 'draw') {
          resultEl.textContent = "It's a draw!";
        } else {
          resultEl.textContent = `Player ${winner} wins!`;
        }
        updateBoard();
        return;
      }

      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      resultEl.textContent = `Player ${currentPlayer}'s turn.`;
      updateBoard();
    });
  });

  resetButton.addEventListener('click', resetGame);
  resetGame();
}

function initWhackMole() {
  const holes = [...document.querySelectorAll('.mole-hole')];
  if (!holes.length) return;
  const scoreEl = document.getElementById('mole-score');
  if (!scoreEl) return;
  const resetButton = document.querySelector('[data-reset="mole"]');
  if (!resetButton) return;

  let score = 0;
  let activeIndex = null;
  let timer = null;

  function updateScore() {
    scoreEl.textContent = String(score);
  }

  function popMole() {
    if (timer) clearTimeout(timer);
    holes.forEach((hole) => hole.classList.remove('active'));
    activeIndex = Math.floor(Math.random() * holes.length);
    holes[activeIndex].classList.add('active');
    timer = setTimeout(() => {
      holes[activeIndex].classList.remove('active');
      activeIndex = null;
    }, 700);
  }

  holes.forEach((hole) => {
    hole.addEventListener('click', () => {
      if (Number(hole.dataset.index) === activeIndex) {
        score += 1;
        updateScore();
        hole.classList.remove('active');
        activeIndex = null;
      }
    });
  });

  resetButton.addEventListener('click', () => {
    score = 0;
    activeIndex = null;
    if (timer) clearTimeout(timer);
    holes.forEach((hole) => hole.classList.remove('active'));
    updateScore();
    popMole();
  });

  updateScore();
  popMole();
}

function initSnake() {
  const canvas = document.getElementById('snake-board');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const scoreEl = document.getElementById('snake-score');
  if (!scoreEl) return;
  const resetButton = document.querySelector('[data-reset="snake"]');
  if (!resetButton) return;

  const gridSize = 11;
  const tileSize = canvas.width / gridSize;
  let snake;
  let direction;
  let nextDirection;
  let apple;
  let intervalId = null;
  let score = 0;

  function resetSnake() {
    snake = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    apple = { x: 8, y: 5 };
    score = 0;
    updateScore();
    draw();
    if (intervalId) {
      clearInterval(intervalId);
    }
    intervalId = setInterval(tick, 150);
  }

  function updateScore() {
    scoreEl.textContent = String(score);
  }

  function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
  }

  function draw() {
    ctx.fillStyle = '#08141a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    snake.forEach((segment) => drawCell(segment.x, segment.y, '#93f1d1'));
    drawCell(apple.x, apple.y, '#ffb788');
  }

  function tick() {
    direction = nextDirection;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize || snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
      clearInterval(intervalId);
      return;
    }

    snake.unshift(head);

    if (head.x === apple.x && head.y === apple.y) {
      score += 1;
      updateScore();
      do {
        apple = {
          x: Math.floor(Math.random() * gridSize),
          y: Math.floor(Math.random() * gridSize)
        };
      } while (snake.some((segment) => segment.x === apple.x && segment.y === apple.y));
    } else {
      snake.pop();
    }

    draw();
  }

  document.addEventListener('keydown', (event) => {
    const map = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 }
    };

    const next = map[event.key];
    if (!next) return;

    const isOpposite = next.x === -direction.x && next.y === -direction.y;
    if (!isOpposite) {
      nextDirection = next;
    }
  });

  resetButton.addEventListener('click', resetSnake);
  resetSnake();
}

function initColorCatch() {
  const field = document.getElementById('color-field');
  const target = document.getElementById('color-target');
  if (!field || !target) return;
  const scoreEl = document.getElementById('color-score');
  if (!scoreEl) return;
  const resetButton = document.querySelector('[data-reset="color"]');
  if (!resetButton) return;

  let score = 0;

  function updateScore() {
    scoreEl.textContent = String(score);
  }

  function moveTarget() {
    const maxX = Math.max(0, field.clientWidth - target.offsetWidth);
    const maxY = Math.max(0, field.clientHeight - target.offsetHeight);
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;
    target.style.left = `${x}px`;
    target.style.top = `${y}px`;
  }

  target.addEventListener('click', () => {
    score += 1;
    updateScore();
    moveTarget();
  });

  resetButton.addEventListener('click', () => {
    score = 0;
    updateScore();
    moveTarget();
  });

  moveTarget();
  updateScore();
}

function initTypingRush() {
  const wordEl = document.getElementById('typing-word');
  const input = document.getElementById('typing-input');
  if (!wordEl || !input) return;
  const scoreEl = document.getElementById('typing-score');
  if (!scoreEl) return;
  const resetButton = document.querySelector('[data-reset="typing"]');
  if (!resetButton) return;
  const words = ['portal', 'pixel', 'rocket', 'orbit', 'signal', 'play', 'level', 'arcade', 'drift', 'fusion'];

  let score = 0;
  let currentWord = words[0];

  function updateScore() {
    scoreEl.textContent = String(score);
  }

  function setWord() {
    currentWord = words[Math.floor(Math.random() * words.length)];
    wordEl.textContent = currentWord;
    input.value = '';
    input.focus();
  }

  input.addEventListener('input', () => {
    if (input.value.trim().toLowerCase() === currentWord) {
      score += 1;
      updateScore();
      setWord();
    }
  });

  resetButton.addEventListener('click', () => {
    score = 0;
    updateScore();
    setWord();
  });

  updateScore();
  setWord();
}

function initPong() {
  const canvas = document.getElementById('pong-board');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const scoreEl = document.getElementById('pong-score');
  if (!scoreEl) return;
  const resetButton = document.querySelector('[data-reset="pong"]');
  if (!resetButton) return;

  let userY = 80;
  let cpuY = 80;
  let ballX = canvas.width / 2;
  let ballY = canvas.height / 2;
  let ballDx = 2.5;
  let ballDy = 2;
  let playerScore = 0;
  let cpuScore = 0;

  function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballDx = Math.random() > 0.5 ? 2.5 : -2.5;
    ballDy = (Math.random() - 0.5) * 4;
  }

  function resetGame() {
    userY = 80;
    cpuY = 80;
    playerScore = 0;
    cpuScore = 0;
    scoreEl.textContent = '0';
    resetBall();
    draw();
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') userY -= 25;
    if (event.key === 'ArrowDown') userY += 25;
    userY = Math.max(10, Math.min(canvas.height - 70, userY));
  });

  function draw() {
    ctx.fillStyle = '#08141a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    ctx.fillStyle = '#93f1d1';
    ctx.fillRect(16, userY, 12, 70);
    ctx.fillStyle = '#7ad7ff';
    ctx.fillRect(canvas.width - 28, cpuY, 12, 70);

    ctx.fillStyle = '#ffb788';
    ctx.beginPath();
    ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  function tick() {
    ballX += ballDx;
    ballY += ballDy;

    if (ballY <= 0 || ballY >= canvas.height) ballDy *= -1;

    if (ballX <= 28 && ballY >= userY && ballY <= userY + 70) {
      ballDx = Math.abs(ballDx) + 0.2;
      ballDy += (ballY - (userY + 35)) * 0.08;
      ballX = 28;
    }

    if (ballX >= canvas.width - 40 && ballY >= cpuY && ballY <= cpuY + 70) {
      ballDx = -Math.abs(ballDx) - 0.2;
      ballDy += (ballY - (cpuY + 35)) * 0.08;
      ballX = canvas.width - 40;
    }

    if (ballX < 0) {
      cpuScore += 1;
      scoreEl.textContent = `${playerScore} - ${cpuScore}`;
      resetBall();
    }

    if (ballX > canvas.width) {
      playerScore += 1;
      scoreEl.textContent = `${playerScore} - ${cpuScore}`;
      resetBall();
    }

    cpuY += (ballY - (cpuY + 35)) * 0.08;
    cpuY = Math.max(10, Math.min(canvas.height - 70, cpuY));

    draw();
  }

  resetButton.addEventListener('click', resetGame);
  resetGame();
  setInterval(tick, 16);
}
