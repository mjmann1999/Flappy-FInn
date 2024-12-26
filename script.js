/****************************/
/*    FLAPPY BIRD CLONE     */
/****************************/

/* Grab the canvas and context */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

/****************************/
/*     RESPONSIVE CANVAS    */
/****************************/
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial sizing

/* Game State Management */
const gameState = {
  current: 'start', // can be: 'start', 'playing', 'gameover'
};

/* Bird object */
const bird = {
  x: 50,
  y: canvas.height / 2,
  radius: 12,
  velocity: 0,
  gravity: 0.5,
  flapStrength: -10,

  flap() {
    this.velocity = this.flapStrength;
  },

  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;
  },

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'yellow';
    ctx.fill();
    ctx.closePath();
  },
};

/* Pipe class */
class Pipe {
  constructor() {
    this.width = 60;
    this.gap = 200; // Increase gap to make game easier
    this.speed = 2;
    this.x = canvas.width;
    // Randomize top pipe height (up to half the canvas)
    this.topHeight = Math.random() * (canvas.height / 2);
    // The rest is bottom pipe
    this.bottomHeight = canvas.height - (this.topHeight + this.gap);
    this.passed = false; // track if we scored a point
  }

  update() {
    this.x -= this.speed;
  }

  draw() {
    ctx.fillStyle = 'green';
    // Top pipe
    ctx.fillRect(this.x, 0, this.width, this.topHeight);
    // Bottom pipe
    ctx.fillRect(
      this.x,
      canvas.height - this.bottomHeight,
      this.width,
      this.bottomHeight
    );
  }
}

/* Array to hold all pipes */
let pipes = [];
let pipeInterval = 1500; // spawn pipes every 1.5 seconds
let lastPipeTime = Date.now();

/* Scoring */
let score = 0;

/****************************/
/*       HELPER FUNCTIONS   */
/****************************/

/* Check collision with pipes */
function checkCollision(pipe) {
  // Bird boundaries
  const birdLeft = bird.x - bird.radius;
  const birdRight = bird.x + bird.radius;
  const birdTop = bird.y - bird.radius;
  const birdBottom = bird.y + bird.radius;

  // Pipe boundaries
  const pipeLeft = pipe.x;
  const pipeRight = pipe.x + pipe.width;

  // Horizontal overlap
  if (birdRight > pipeLeft && birdLeft < pipeRight) {
    // If bird is above top pipe OR below bottom pipe
    if (
      birdTop < pipe.topHeight ||
      birdBottom > canvas.height - pipe.bottomHeight
    ) {
      return true;
    }
  }
  return false;
}

/* Check collision with ground/ceiling */
function checkBoundaryCollision() {
  if (bird.y - bird.radius < 0 || bird.y + bird.radius > canvas.height) {
    return true;
  }
  return false;
}

/* Update score when bird passes pipes */
function updateScore() {
  pipes.forEach((pipe) => {
    if (!pipe.passed && pipe.x + pipe.width < bird.x) {
      pipe.passed = true;
      score++;
    }
  });
}

/* Reset the game to initial state */
function resetGame() {
  bird.y = canvas.height / 2;
  bird.velocity = 0;
  score = 0;
  pipes = [];
  lastPipeTime = Date.now();
}

/****************************/
/*         GAME LOOP        */
/****************************/

function update() {
  // If gameState is playing, update bird & pipes
  if (gameState.current === 'playing') {
    bird.update();

    // Spawn pipes
    if (Date.now() - lastPipeTime > pipeInterval) {
      pipes.push(new Pipe());
      lastPipeTime = Date.now();
    }

    // Update pipes
    pipes.forEach((pipe) => {
      pipe.update();
    });

    // Remove off-screen pipes
    pipes = pipes.filter((pipe) => pipe.x + pipe.width > 0);

    // Check collisions
    for (let i = 0; i < pipes.length; i++) {
      if (checkCollision(pipes[i]) || checkBoundaryCollision()) {
        gameState.current = 'gameover';
        break;
      }
    }

    // Update score
    updateScore();
  }
}

function render() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw bird (only after 'start' state is over)
  if (gameState.current !== 'start') {
    bird.draw();
  }

  // Draw pipes
  pipes.forEach((pipe) => {
    pipe.draw();
  });

  // Draw score (during playing or gameover)
  if (gameState.current === 'playing' || gameState.current === 'gameover') {
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
  }

  // Handle game states
  if (gameState.current === 'start') {
    drawStartScreen();
  } else if (gameState.current === 'gameover') {
    drawGameOverScreen();
  }
}

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

/****************************/
/*      DRAWING SCREENS     */
/****************************/

function drawStartScreen() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);

  ctx.fillStyle = 'white';
  ctx.font = '36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Flappy Bird Clone', canvas.width / 2, canvas.height / 2 - 10);
  ctx.font = '20px Arial';
  ctx.fillText('Press SPACE or TAP to Start', canvas.width / 2, canvas.height / 2 + 20);
}

function drawGameOverScreen() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);

  ctx.fillStyle = 'white';
  ctx.font = '36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 10);
  ctx.font = '24px Arial';
  ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 25);
  ctx.font = '20px Arial';
  ctx.fillText('Press SPACE or TAP to Restart', canvas.width / 2, canvas.height / 2 + 50);
}

/****************************/
/*      INPUT HANDLING      */
/****************************/

function handleInput() {
  if (gameState.current === 'start') {
    // Start the game
    resetGame();
    gameState.current = 'playing';
  } else if (gameState.current === 'gameover') {
    // Restart the game
    resetGame();
    gameState.current = 'playing';
  } else if (gameState.current === 'playing') {
    // Flap the bird
    bird.flap();
  }
}

// Keyboard control
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    handleInput();
  }
});

// Mouse/Touch control
document.addEventListener('click', handleInput);
document.addEventListener('touchstart', handleInput, { passive: false });

/****************************/
/*        START GAME        */
/****************************/
gameLoop();
