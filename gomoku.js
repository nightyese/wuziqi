class Gomoku {
    constructor() {
        this.boardSize = 15;
        this.cellSize = 40;
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
        this.currentPlayer = 1; // 1为玩家(黑子)，2为电脑(白子)
        this.gameOver = false;
        this.history = [];
        this.difficulty = "中等";

        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 设置画布大小
        this.canvas.width = this.boardSize * this.cellSize;
        this.canvas.height = this.boardSize * this.cellSize;

        this.setupEventListeners();
        this.drawBoard();
    }

    setupEventListeners() {
        // 棋盘点击事件
        this.canvas.addEventListener('click', (event) => {
            if (this.gameOver || this.currentPlayer !== 1) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            const col = Math.floor(x / this.cellSize);
            const row = Math.floor(y / this.cellSize);

            if (row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize && this.board[row][col] === 0) {
                this.makeMove(row, col, 1);
                if (!this.gameOver) {
                    this.computerMove();
                }
            }
        });

        // 难度选择事件
        document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.difficulty = e.target.value;
            });
        });

        // 悔棋按钮事件
        document.getElementById('undoButton').addEventListener('click', () => this.undoMove());

        // 重新开始按钮事件
        document.getElementById('restartButton').addEventListener('click', () => this.restartGame());
    }

    drawBoard() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制棋盘线
        for (let i = 0; i < this.boardSize; i++) {
            // 横线
            this.ctx.beginPath();
            this.ctx.moveTo(this.cellSize/2, i*this.cellSize + this.cellSize/2);
            this.ctx.lineTo(this.boardSize*this.cellSize - this.cellSize/2, i*this.cellSize + this.cellSize/2);
            this.ctx.stroke();
            
            // 竖线
            this.ctx.beginPath();
            this.ctx.moveTo(i*this.cellSize + this.cellSize/2, this.cellSize/2);
            this.ctx.lineTo(i*this.cellSize + this.cellSize/2, this.boardSize*this.cellSize - this.cellSize/2);
            this.ctx.stroke();
        }

        // 重绘所有棋子
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] !== 0) {
                    this.drawPiece(i, j, this.board[i][j]);
                }
            }
        }
    }

    drawPiece(row, col, player) {
        const x = col * this.cellSize + this.cellSize/2;
        const y = row * this.cellSize + this.cellSize/2;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, 15, 0, Math.PI * 2);
        this.ctx.fillStyle = player === 1 ? 'black' : 'white';
        this.ctx.fill();
        if (player === 2) {
            this.ctx.strokeStyle = 'black';
            this.ctx.stroke();
        }
    }

    makeMove(row, col, player) {
        this.board[row][col] = player;
        this.drawPiece(row, col, player);
        this.history.push({row, col, player});

        if (this.checkWin(row, col)) {
            const winner = player === 1 ? "玩家" : "电脑";
            alert(`${winner}获胜！`);
            this.gameOver = true;
        } else {
            this.currentPlayer = 3 - player;
        }
    }

    computerMove() {
        const emptyCells = [];
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === 0) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }

        if (emptyCells.length === 0) return;

        let move;
        if (this.difficulty === "简单") {
            move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        } else {
            let bestScore = -Infinity;
            let bestMove = null;

            for (const cell of emptyCells) {
                const computerScore = this.evaluatePosition(cell.row, cell.col, 2);
                const playerScore = this.evaluatePosition(cell.row, cell.col, 1);

                let score;
                if (this.difficulty === "困难") {
                    score = computerScore + playerScore * 0.8;
                } else { // 中等
                    score = computerScore + playerScore * 0.5;
                }

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = cell;
                }
            }
            move = bestMove;
        }

        this.makeMove(move.row, move.col, 2);
    }

    checkWin(row, col) {
        const directions = [[1,0], [0,1], [1,1], [1,-1]];
        const player = this.board[row][col];

        for (const [dx, dy] of directions) {
            let count = 1;
            
            // 正向检查
            for (let i = 1; i < 5; i++) {
                const newRow = row + dx*i;
                const newCol = col + dy*i;
                if (newRow < 0 || newRow >= this.boardSize || newCol < 0 || newCol >= this.boardSize) break;
                if (this.board[newRow][newCol] !== player) break;
                count++;
            }

            // 反向检查
            for (let i = 1; i < 5; i++) {
                const newRow = row - dx*i;
                const newCol = col - dy*i;
                if (newRow < 0 || newRow >= this.boardSize || newCol < 0 || newCol >= this.boardSize) break;
                if (this.board[newRow][newCol] !== player) break;
                count++;
            }

            if (count >= 5) return true;
        }
        return false;
    }

    evaluatePosition(row, col, player) {
        let score = 0;
        const directions = [[1,0], [0,1], [1,1], [1,-1]];

        for (const [dx, dy] of directions) {
            let count = 1;
            let block = 0;

            // 正向检查
            for (let i = 1; i < 5; i++) {
                const newRow = row + dx*i;
                const newCol = col + dy*i;
                if (newRow < 0 || newRow >= this.boardSize || newCol < 0 || newCol >= this.boardSize) {
                    block++;
                    break;
                }
                if (this.board[newRow][newCol] === player) {
                    count++;
                } else if (this.board[newRow][newCol] === 0) {
                    break;
                } else {
                    block++;
                    break;
                }
            }

            // 反向检查
            for (let i = 1; i < 5; i++) {
                const newRow = row - dx*i;
                const newCol = col - dy*i;
                if (newRow < 0 || newRow >= this.boardSize || newCol < 0 || newCol >= this.boardSize) {
                    block++;
                    break;
                }
                if (this.board[newRow][newCol] === player) {
                    count++;
                } else if (this.board[newRow][newCol] === 0) {
                    break;
                } else {
                    block++;
                    break;
                }
            }

            if (count >= 5) score += 100000;
            else if (count === 4) {
                if (block === 0) score += 10000;
                else if (block === 1) score += 1000;
            }
            else if (count === 3) {
                if (block === 0) score += 1000;
                else if (block === 1) score += 100;
            }
            else if (count === 2) {
                if (block === 0) score += 100;
                else if (block === 1) score += 10;
            }
        }
        return score;
    }

    undoMove() {
        if (this.history.length >= 2 && !this.gameOver) {
            this.history.pop();
            this.history.pop();
            
            // 重置棋盘
            this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
            
            // 重新应用历史记录
            for (const move of this.history) {
                this.board[move.row][move.col] = move.player;
            }
            
            this.drawBoard();
            this.currentPlayer = 1;
        }
    }

    restartGame() {
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
        this.currentPlayer = 1;
        this.gameOver = false;
        this.history = [];
        this.drawBoard();
    }
}

// 初始化游戏
window.onload = () => {
    new Gomoku();
}; 