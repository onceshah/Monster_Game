const runner = document.getElementById("runner");
const monster = document.getElementById("monster");
const game = document.getElementById("game");
const message = document.getElementById("message");
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

let lanes = [50, 175, 300];
let runnerLane = 1;
let monsterLane = 1;
let gameOver = false;
let runnerInterval = null;
let fumbleTimeout = null;

// --- RESET POSITIONS ---
function resetPositions() {
  runnerLane = 1;
  monsterLane = 1;
  gameOver = false;
  message.innerText = "";

  runner.style.left = lanes[runnerLane] + "px";
  runner.style.bottom = "150px";
  monster.style.left = lanes[monsterLane] + "px";
  monster.style.bottom = "50px";

  document.querySelectorAll(".obstacle").forEach(o => o.remove());

  // remove pause
  game.classList.remove("paused");

  // Reset random fumble (between 30–60s)
  if (fumbleTimeout) clearTimeout(fumbleTimeout);
  let fumbleTime = 30000 + Math.random() * 30000;
  fumbleTimeout = setTimeout(() => runnerFumble(), fumbleTime);
}

// --- RUNNER FUMBLE ---
function runnerFumble() {
  if (!gameOver) {
    gameOver = true;
    game.classList.add("paused"); // stop road
    message.innerText = "🏆 You Win! Runner stumbled on its own!";
    restartBtn.style.display = "block";
  }
}

// --- RUNNER AI ---
function moveRunner() {
  if (gameOver) return;

  // random lane change
  runnerLane = Math.floor(Math.random() * 3);
  runner.style.left = lanes[runnerLane] + "px";

  // spawn obstacles (rock, bar, fire)
  if (Math.random() < 0.7) {
    let types = ["jump-only", "slide-only", "jump-or-slide"];
    let type = types[Math.floor(Math.random() * types.length)];
    spawnObstacle(runnerLane, type);
  }

  runnerInterval = setTimeout(moveRunner, 1500);
}

// --- OBSTACLE ---
function spawnObstacle(lane, type) {
  let obs = document.createElement("div");
  obs.className = "obstacle " + type;
  obs.style.left = (lanes[lane] - 10) + "px";
  obs.style.top = "-80px";
  obs.style.width = "100px";
  obs.style.height = "100px";
  game.appendChild(obs);

  let fall = setInterval(() => {
    let top = parseInt(obs.style.top);
    obs.style.top = (top + 5) + "px";

    // Runner vs obstacle (auto AI reacts here)
    if (top > 400 && top < 460 && lane === runnerLane && !gameOver) {
      if (type === "jump-only" || type === "jump-or-slide") {
        runner.classList.add("jump");
        setTimeout(() => runner.classList.remove("jump"), 600);
      }
      if (type === "slide-only") {
        runner.classList.add("slide");
        setTimeout(() => runner.classList.remove("slide"), 600);
      }
    }

    // Monster collision
    if (top > 500 && top < 560 && lane === monsterLane && !gameOver) {
      if (type === "jump-only" || type === "jump-or-slide") {
        if (!monster.classList.contains("jumping")) {
          gameOver = true;
          game.classList.add("paused"); // stop road
          message.innerText = "😢 You Lose! Monster hit an obstacle!";
          restartBtn.style.display = "block";
        }
      }
      if (type === "slide-only") {
        if (!monster.classList.contains("sliding")) {
          gameOver = true;
          game.classList.add("paused"); // stop road
          message.innerText = "😢 You Lose! Monster hit a bar!";
          restartBtn.style.display = "block";
        }
      }
    }

    if (top > 600) {
      obs.remove();
      clearInterval(fall);
    }
  }, 30);
}

// --- MONSTER CONTROLS ---
document.addEventListener("keydown", e => {
  if (gameOver) return;

  if (e.key === "ArrowLeft" && monsterLane > 0) monsterLane--;
  if (e.key === "ArrowRight" && monsterLane < 2) monsterLane++;
  monster.style.left = lanes[monsterLane] + "px";

  if (e.key === "ArrowUp") {
    monster.classList.add("jumping", "jump");
    setTimeout(() => monster.classList.remove("jump", "jumping"), 600);
  }

  if (e.key === "ArrowDown") {
    monster.classList.add("sliding", "slide");
    setTimeout(() => monster.classList.remove("slide", "sliding"), 600);
  }
});

// --- START / RESTART ---
startBtn.addEventListener("click", () => {
  startScreen.style.display = "none";
  resetPositions();
  moveRunner();
});

restartBtn.addEventListener("click", () => {
  restartBtn.style.display = "none";
  resetPositions();
  moveRunner();
});
