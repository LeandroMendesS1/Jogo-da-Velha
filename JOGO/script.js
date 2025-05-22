// Variáveis globais
let playerName = "JOG";
let playerPoints = 0;
let leaderboard = JSON.parse(localStorage.getItem('jogoDaVelhaLeaderboard')) || [];

document.addEventListener('DOMContentLoaded', () => {
    // Obter nome do jogador e exibir
    playerName = getPlayerName();
    document.getElementById('player-name-display').textContent = playerName;

    // Inicializa o ranking
    renderLeaderboard();

    // Elementos da interface
    const cells = document.querySelectorAll('.cell');
    const statusDisplay = document.getElementById('status');
    const resetButton = document.getElementById('reset-btn');
    const board = document.querySelector('.board');

    // Estado do jogo
    let gameActive = true;
    let currentPlayer = "X";
    let gameState = Array(9).fill("");

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    // Mensagens do jogo
    const messages = {
        currentTurn: () => `Vez do jogador ${currentPlayer}`,
        win: () => `Jogador ${currentPlayer} venceu!`,
        draw: () => `Empate!`
    };

    statusDisplay.textContent = messages.currentTurn();

    // Inicializa evento das células
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
        cell.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCellClick(e);
            }
        });
    });

    resetButton.addEventListener('click', resetGame);

    // Funções de Jogo
    function handleCellClick(e) {
        const cell = e.target;
        const index = parseInt(cell.getAttribute('data-index'));
        if (gameState[index] !== "" || !gameActive) return;

        playMove(cell, index);
    }

    function playMove(cell, index) {
        gameState[index] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer.toLowerCase());
        cell.setAttribute('aria-label', `Célula ${index + 1}, ${currentPlayer}`);
        checkResult();
    }

    function makeCpuMove() {
        console.log("CPU tentando jogar...");
        if (!gameActive || currentPlayer !== "O") return;

        // 1. Verifica se precisa bloquear o jogador humano
        let move = findWinningMove("X");
        if (move !== null) {
            makeMoveWithAnimation(move);
            return;
        }

        // 2. Verifica se pode vencer
        move = findWinningMove("O");
        if (move !== null) {
            makeMoveWithAnimation(move);
            return;
        }

        // 3. Caso contrário, faz uma jogada aleatória
        const availableMoves = gameState
            .map((cell, index) => cell === "" ? index : null)
            .filter(val => val !== null);

        if (availableMoves.length > 0) {
            const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            makeMoveWithAnimation(randomMove);
        }
    }

    function makeMoveWithAnimation(index) {
        const cell = document.querySelector(`.cell[data-index="${index}"]`);
        if (!cell || gameState[index] !== "") return;

        cell.classList.add('cpu-move');
        setTimeout(() => {
            playMove(cell, index);
            cell.classList.remove('cpu-move');
        }, 400);
    }

    function findWinningMove(player) {
        for (let combo of winningConditions) {
            const [a, b, c] = combo;
            const cells = [gameState[a], gameState[b], gameState[c]];
            const emptyIndex = cells.indexOf("");
            if (cells.filter(val => val === player).length === 2 && emptyIndex !== -1) {
                return combo[emptyIndex];
            }
        }
        return null;
    }

    function checkResult() {
        let winCombo = null;
        for (let combo of winningConditions) {
            const [a, b, c] = combo;
            if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                winCombo = combo;
                break;
            }
        }

        if (winCombo) {
            gameActive = false;
            statusDisplay.textContent = messages.win();
            statusDisplay.setAttribute('aria-live', 'assertive');
            drawWinningLine(winCombo);
            if (currentPlayer === "X") updatePoints('win');
            return;
        }

        if (!gameState.includes("")) {
            gameActive = false;
            statusDisplay.textContent = messages.draw();
            statusDisplay.setAttribute('aria-live', 'assertive');
            showDraw();
            updatePoints('draw');
            return;
        }

        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusDisplay.textContent = messages.currentTurn();

        if (gameActive && currentPlayer === "O") {
            setTimeout(makeCpuMove, 800);
        }
    }

    function resetGame() {
        gameActive = true;
        currentPlayer = "X";
        gameState.fill("");
        statusDisplay.textContent = messages.currentTurn();
        statusDisplay.setAttribute('aria-live', 'polite');
        document.querySelectorAll('.winning-line, .draw-v').forEach(el => el.remove());

        cells.forEach((cell, i) => {
            cell.textContent = "";
            cell.className = "cell";
            cell.setAttribute('aria-label', `Célula ${i + 1}, vazia`);
        });
    }

    function drawWinningLine(combo) {
        const line = document.createElement('div');
        line.className = 'winning-line';

        const classMap = {
            "012": 'row-0', "345": 'row-1', "678": 'row-2',
            "036": 'col-0', "147": 'col-1', "258": 'col-2',
            "048": 'diagonal-1', "246": 'diagonal-2'
        };

        const key = combo.join('');
        line.classList.add(classMap[key] || '');

        board.appendChild(line);
        combo.forEach(i => cells[i].classList.add('winner'));
    }

    function showDraw() {
        const draw = document.createElement('div');
        draw.className = 'draw-v';

        const line1 = document.createElement('div');
        line1.className = 'draw-v-line first';
        line1.style.setProperty('--angle', '45deg');

        const line2 = document.createElement('div');
        line2.className = 'draw-v-line second';
        line2.style.setProperty('--angle', '-45deg');

        draw.appendChild(line1);
        draw.appendChild(line2);
        board.appendChild(draw);
    }

    // Pontuação e Ranking
    function updatePoints(result) {
        if (result === 'win') playerPoints += 3;
        else if (result === 'draw') playerPoints += 1;

        document.getElementById('player-points').textContent = playerPoints;
        updateLeaderboard();
    }

    function updateLeaderboard() {
        const existing = leaderboard.find(p => p.name === playerName);
        if (existing) {
            existing.points = Math.max(existing.points, playerPoints);
        } else {
            leaderboard.push({ name: playerName, points: playerPoints });
        }

        leaderboard.sort((a, b) => b.points - a.points);
        leaderboard = leaderboard.slice(0, 5);

        localStorage.setItem('jogoDaVelhaLeaderboard', JSON.stringify(leaderboard));
        renderLeaderboard();
    }

    function renderLeaderboard() {
        const tbody = document.querySelector('#leaderboard-table tbody');
        tbody.innerHTML = '';
        leaderboard.forEach((p, i) => {
            tbody.innerHTML += `<tr><td>${i + 1}º</td><td>${p.name}</td><td>${p.points}</td></tr>`;
        });
    }

    function getPlayerName() {
        let name = "";
        while (name.length !== 3) {
            name = prompt("Digite seu nome (3 letras):", "JOG").toUpperCase().substr(0, 3);
            if (name.length < 3) name = name.padEnd(3, "X");
        }
        return name;
    }
});