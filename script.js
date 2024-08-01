document.addEventListener('DOMContentLoaded', () => {
    const width = 10;
    const height = 10;
    const minesCount = 20;
    const board = document.getElementById('game-board');
    const message = document.getElementById('message');
    const timerDisplay = document.getElementById('timer');
    const scoreDisplay = document.getElementById('score');
    let cells = [];
    let minePositions = [];
    let isGameOver = false;
    let revealedCount = 0;
    let timer = 0;
    let timerInterval;

    function initGame() {
        isGameOver = false;
        revealedCount = 0;
        cells = [];
        minePositions = [];
        board.innerHTML = '';
        message.textContent = 'Click on a cell to start the game.';
        scoreDisplay.textContent = 'Score: 0';
        timer = 0;
        timerDisplay.textContent = `Time: ${timer}s`;

        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (!isGameOver) {
                timer++;
                timerDisplay.textContent = `Time: ${timer}s`;
            }
        }, 1000);

        // Create the grid
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.x = x;
                cell.dataset.y = y;
                cell.addEventListener('click', () => handleClick(cell));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    handleRightClick(cell);
                });
                board.appendChild(cell);
                cells.push(cell);
            }
        }

        // Place mines
        while (minePositions.length < minesCount) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const position = `${x}-${y}`;
            if (!minePositions.includes(position)) {
                minePositions.push(position);
                const cell = getCell(x, y);
                cell.dataset.isMine = true;
            }
        }

        // Count neighboring mines
        cells.forEach(cell => {
            const x = parseInt(cell.dataset.x);
            const y = parseInt(cell.dataset.y);
            const mineCount = countNeighboringMines(x, y);
            if (mineCount > 0) {
                cell.dataset.count = mineCount;
            }
        });
    }

    function getCell(x, y) {
        return cells.find(cell => cell.dataset.x == x && cell.dataset.y == y);
    }

    function countNeighboringMines(x, y) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],         [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        let count = 0;
        directions.forEach(([dx, dy]) => {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                if (getCell(nx, ny).dataset.isMine) {
                    count++;
                }
            }
        });
        return count;
    }

    function handleClick(cell) {
        if (isGameOver || cell.classList.contains('revealed')) return;

        if (cell.dataset.isMine) {
            revealAllMines();
            cell.classList.add('revealed');
            cell.textContent = '💣'; // Bomb emoji
            gameOver(false);
            return;
        }
        revealCell(cell);
        if (revealedCount === width * height - minesCount) {
            gameOver(true);
        }
    }

    function revealCell(cell) {
        if (cell.classList.contains('revealed')) return;
        cell.classList.add('revealed');
        revealedCount++;
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        const mineCount = parseInt(cell.dataset.count) || 0;
        if (mineCount === 0) {
            const directions = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1],         [0, 1],
                [1, -1], [1, 0], [1, 1]
            ];
            directions.forEach(([dx, dy]) => {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const neighborCell = getCell(nx, ny);
                    if (!neighborCell.classList.contains('revealed')) {
                        revealCell(neighborCell);
                    }
                }
            });
        } else {
            cell.textContent = mineCount;
        }
    }

    function handleRightClick(cell) {
        if (isGameOver || cell.classList.contains('revealed')) return;

        if (cell.classList.contains('flagged')) {
            cell.classList.remove('flagged');
        } else {
            cell.classList.add('flagged');
        }
    }

    function revealAllMines() {
        cells.forEach(cell => {
            if (cell.dataset.isMine) {
                cell.classList.add('revealed');
                cell.textContent = '💣'; // Bomb emoji
            }
        });
    }

    function gameOver(isWin) {
        clearInterval(timerInterval);
        isGameOver = true;
        if (isWin) {
            message.textContent = 'Congratulations! You won!';
            scoreDisplay.textContent = `Score: ${timer}s`;
        } else {
            message.textContent = 'Game Over! You hit a mine.';
        }
    }

    document.getElementById('reset').addEventListener('click', initGame);

    initGame();
});
