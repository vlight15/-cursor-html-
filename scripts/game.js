let snake = [{ x: 10, y: 10 }];
let food = {};
let obstacles = [];
let score = 0;
let direction = { x: 0, y: 0 };
let gameInterval;
const gameArea = document.getElementById('game-area');
const scoreDisplay = document.getElementById('score');
const startButton = document.getElementById('start-button');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
let snakeElements = []; // 用于存储蛇的DOM元素

startButton.addEventListener('click', startGame);

// 添加键盘事件监听器
document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
    switch (event.key) {
        case 'ArrowUp':
            if (direction.y === 0) {
                direction = { x: 0, y: -1 }; // 向上移动
            }
            break;
        case 'ArrowDown':
            if (direction.y === 0) {
                direction = { x: 0, y: 1 }; // 向下移动
            }
            break;
        case 'ArrowLeft':
            if (direction.x === 0) {
                direction = { x: -1, y: 0 }; // 向左移动
            }
            break;
        case 'ArrowRight':
            if (direction.x === 0) {
                direction = { x: 1, y: 0 }; // 向右移动
            }
            break;
    }
}

function startGame() {
    snake = [{ x: 10, y: 10 }];
    score = 0;
    direction = { x: 0, y: 0 };
    obstacles = [];
    gameArea.innerHTML = '';
    generateFood();
    
    const difficulty = document.getElementById('difficulty').value;
    if (difficulty !== 'easy') {
        generateObstacles(); // 只有在难度不是简单时才生成障碍物
    }

    gameInterval = setInterval(gameLoop, 100);
    startScreen.style.display = 'none';
    gameScreen.style.display = 'block';
}

function gameLoop() {
    moveSnake();
    if (checkCollision()) {
        clearInterval(gameInterval);
        alert('游戏结束！得分: ' + score);
        saveScore();
        startScreen.style.display = 'block';
        gameScreen.style.display = 'none';
    }
    draw();
}

function moveSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score++;
        generateFood();
    } else {
        snake.pop();
    }
}

function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) return true;
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) return true;
    }
    for (const obstacle of obstacles) {
        if (head.x === obstacle.x && head.y === obstacle.y) return true;
    }
    return false;
}

function draw() {
    // 更新蛇的每个部分的位置
    snake.forEach((segment, index) => {
        if (!snakeElements[index]) {
            const segmentDiv = document.createElement('div');
            segmentDiv.className = 'snake';
            segmentDiv.style.width = '20px';
            segmentDiv.style.height = '20px';
            segmentDiv.style.position = 'absolute'; // 确保位置绝对
            gameArea.appendChild(segmentDiv);
            snakeElements[index] = segmentDiv; // 存储DOM元素
        }
        // 更新位置
        snakeElements[index].style.left = segment.x * 20 + 'px';
        snakeElements[index].style.top = segment.y * 20 + 'px';
    });

    // 处理食物的绘制
    let foodDiv = document.querySelector('.food'); // 查找现有的食物元素
    if (!foodDiv) {
        foodDiv = document.createElement('div');
        foodDiv.className = 'food';
        foodDiv.style.width = '20px';
        foodDiv.style.height = '20px';
        gameArea.appendChild(foodDiv);
    }
    foodDiv.style.left = food.x * 20 + 'px';
    foodDiv.style.top = food.y * 20 + 'px';

    // 绘制障碍物
    obstacles.forEach(obstacle => {
        const obstacleDiv = document.createElement('div');
        obstacleDiv.className = 'obstacle';
        obstacleDiv.style.width = '20px';
        obstacleDiv.style.height = '20px';
        obstacleDiv.style.left = obstacle.x * 20 + 'px';
        obstacleDiv.style.top = obstacle.y * 20 + 'px';
        gameArea.appendChild(obstacleDiv);
    });

    // 更新得分显示
    scoreDisplay.innerText = '得分: ' + score;
}

function generateFood() {
    let attempts = 0;
    do {
        food = {
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20)
        };
        attempts++;
        if (attempts > 100) {
            break;
        }
    } while (isPositionOccupied(food));
}

function generateObstacles() {
    const numObstacles = Math.floor(Math.random() * 5) + 5; // 随机生成5到10个障碍物
    for (let i = 0; i < numObstacles; i++) {
        let newObstacle;
        let attempts = 0;
        do {
            newObstacle = {
                x: Math.floor(Math.random() * 20),
                y: Math.floor(Math.random() * 20)
            };
            attempts++;
            if (attempts > 100) {
                break;
            }
        } while (isPositionOccupied(newObstacle));
        obstacles.push(newObstacle);
    }
}

function isPositionOccupied(position) {
    // 检查是否与蛇重叠
    for (const segment of snake) {
        if (segment.x === position.x && segment.y === position.y) {
            return true;
        }
    }
    // 检查是否与障碍物重叠
    for (const obstacle of obstacles) {
        if (obstacle.x === position.x && obstacle.y === position.y) {
            return true;
        }
    }
    return false;
}

function saveScore() {
    const username = prompt('请输入用户名:');
    const difficulty = document.getElementById('difficulty').value;
    if (username) {
        const scores = JSON.parse(localStorage.getItem('scores')) || [];
        scores.push({ username, score, difficulty });
        localStorage.setItem('scores', JSON.stringify(scores));
        updateLeaderboard();
    }
}

function updateLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('scores')) || [];
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = '';

    const difficulties = ['easy', 'medium', 'hard'];
    difficulties.forEach(difficulty => {
        const difficultyContainer = document.createElement('div');
        difficultyContainer.className = 'difficulty-container';

        const header = document.createElement('h3');
        header.innerText = `难度: ${difficulty}`;
        difficultyContainer.appendChild(header);

        const difficultyScores = scores.filter(entry => entry.difficulty === difficulty);
        difficultyScores.sort((a, b) => b.score - a.score);

        difficultyScores.forEach(entry => {
            const div = document.createElement('div');
            div.innerText = `${entry.username}: ${entry.score}`;
            difficultyContainer.appendChild(div);
        });

        leaderboard.appendChild(difficultyContainer);
    });
}

function clearLeaderboardMonthly() {
    const lastClearTime = localStorage.getItem('lastClearTime');
    const currentTime = new Date().getTime();
    const oneMonth = 30 * 24 * 60 * 60 * 1000; // 30天的毫秒数

    if (!lastClearTime || currentTime - lastClearTime > oneMonth) {
        localStorage.removeItem('scores');
        localStorage.setItem('lastClearTime', currentTime);
        updateLeaderboard();
    }
}

// 每天检查一次
setInterval(clearLeaderboardMonthly, 24 * 60 * 60 * 1000);

// 初始化排行榜
updateLeaderboard(); 