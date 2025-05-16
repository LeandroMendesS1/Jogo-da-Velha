document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const statusDisplay = document.getElementById('status');
    const resetButton = document.getElementById('reset-btn');
    const board = document.querySelector('.board');

    let gameMode = "human";
    
    let gameActive = true;
    let currentPlayer = "X";
    let gameState = ["", "", "", "", "", "", "", "", ""];
    
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // linhas
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // colunas
        [0, 4, 8], [2, 4, 6]             // diagonais
    ];
    
    // Mensagens do jogo
    const winningMessage = () => `Jogador ${currentPlayer} venceu!`;
    const drawMessage = () => `Empate!`;
    const currentPlayerTurn = () => `Vez do jogador ${currentPlayer}`;
    
    // Inicializa o jogo
    statusDisplay.textContent = currentPlayerTurn();

        function makeCpuMove() {
        // Estratégia simples: primeiro tenta vencer, depois bloqueia, depois joga aleatório

        if (!gameActive || currentPlayer !== "O") return;
        
        // 1. Verifica se pode vencer
        let move = findWinningMove("O");
        if (move !== null) {
            makeMove(move);
            return;
        }
        
        // 2. Verifica se precisa bloquear o jogador humano
        move = findWinningMove("X");
        if (move !== null) {
            makeMove(move);
            return;
        }
        
        // 3. Se não, faz uma jogada aleatória
        const availableMoves = gameState
            .map((cell, index) => cell === "" ? index : null)
            .filter(val => val !== null);
        
        if (availableMoves.length > 0) {
            const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            makeMove(randomMove);
        }
    }

    function findWinningMove(player) {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            // Verifica se há duas marcas do jogador e um espaço vazio
            const cells = [gameState[a], gameState[b], gameState[c]];
            const emptyIndex = cells.indexOf("");
            
            if (cells.filter(val => val === player).length === 2 && emptyIndex !== -1) {
                return winningConditions[i][emptyIndex];
            }
        }
        return null;
    }

    function makeMove(index) {
        const cell = document.querySelector(`.cell[data-index="${index}"]`);
        cell.classList.add('cpu-move'); // Adicione esta classe
        setTimeout(() => {
            cell.click();
            cell.classList.remove('cpu-move');
        }, 400);
    }
    
    // Função para manipular o clique na célula
    function handleCellClick(clickedCellEvent) {
        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
        
        // Se a célula já foi usada ou o jogo não está ativo, ignorar
        if (gameState[clickedCellIndex] !== "" || !gameActive) return;
        
        // Atualizar estado do jogo e interface
        handleCellPlayed(clickedCell, clickedCellIndex);
        //handleResultValidation();
    }
    
    // Função para manipular o evento de teclado na célula
    function handleCellKeyDown(e) {
        // Permitir interação com Enter ou Space
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCellClick(e);
        }
    }
    
    // Atualiza o estado interno do jogo e a interface
    function handleCellPlayed(clickedCell, clickedCellIndex) {
        gameState[clickedCellIndex] = currentPlayer;
        clickedCell.textContent = currentPlayer;
        clickedCell.classList.add(currentPlayer.toLowerCase()); // Adiciona classe x ou o
        clickedCell.setAttribute('aria-label', `Célula ${clickedCellIndex + 1}, ${currentPlayer}`);

        // Verifica se o jogo continua após esta jogada
        handleResultValidation();
        
        // Se for modo CPU e o jogo ainda está ativo, faz a jogada da CPU
        if (gameActive && gameMode === "cpu" && currentPlayer === "O") {
        setTimeout(makeCpuMove, 800);
        }
    }
    
    // Função para desenhar a linha vencedora
    function drawWinningLine(winningCombination) {
    const line = document.createElement('div');
    line.className = 'winning-line';
    
    // Remove qualquer linha existente
    document.querySelectorAll('.winning-line').forEach(el => el.remove());
    
    // Determina o tipo de linha baseado na combinação vencedora
    if (winningCombination.includes(0) && winningCombination.includes(1) && winningCombination.includes(2)) {
        line.classList.add('row-0');
    } else if (winningCombination.includes(3) && winningCombination.includes(4) && winningCombination.includes(5)) {
        line.classList.add('row-1');
    } else if (winningCombination.includes(6) && winningCombination.includes(7) && winningCombination.includes(8)) {
        line.classList.add('row-2');
    } else if (winningCombination.includes(0) && winningCombination.includes(3) && winningCombination.includes(6)) {
        line.classList.add('col-0');
    } else if (winningCombination.includes(1) && winningCombination.includes(4) && winningCombination.includes(7)) {
        line.classList.add('col-1');
    } else if (winningCombination.includes(2) && winningCombination.includes(5) && winningCombination.includes(8)) {
        line.classList.add('col-2');
    } else if (winningCombination.includes(0) && winningCombination.includes(4) && winningCombination.includes(8)) {
        line.classList.add('diagonal-1');
        line.style.setProperty('--angle', '45deg');
    } else if (winningCombination.includes(2) && winningCombination.includes(4) && winningCombination.includes(6)) {
        line.classList.add('diagonal-2');
        line.style.setProperty('--angle', '-45deg');
    }
    
    board.appendChild(line);
    
    // Destacar células vencedoras
    winningCombination.forEach(index => {
        cells[index].classList.add('winner');
    });
}
    
    // Função para mostrar empate
function showDraw() {
    const drawElement = document.createElement('div');
    drawElement.className = 'draw-v';
    
    // Cria as duas linhas do V
    const line1 = document.createElement('div');
    line1.className = 'draw-v-line first';
    line1.style.setProperty('--angle', '45deg');
    
    const line2 = document.createElement('div');
    line2.className = 'draw-v-line second';
    line2.style.setProperty('--angle', '-45deg');
    
    // Remove qualquer V existente
    document.querySelectorAll('.draw-v').forEach(el => el.remove());
    
    drawElement.appendChild(line1);
    drawElement.appendChild(line2);
    board.appendChild(drawElement);
    }
    
    // Função para limpar a linha vencedora e empate
    function clearBoardEffects() {
        document.querySelectorAll('.winning-line, .draw-v').forEach(el => el.remove());
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('winner');
        });
    }
    
    // Verifica se houve vitória ou empate
    function handleResultValidation() {
        let roundWon = false;
        let winningCombination = null;
        
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (gameState[a] === "" || gameState[b] === "" || gameState[c] === "") continue;
            
            if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
                roundWon = true;
                winningCombination = winningConditions[i];
                break;
            }
        }
        
        if (roundWon) {
            statusDisplay.textContent = winningMessage();
            statusDisplay.setAttribute('aria-live', 'assertive');
            gameActive = false;
            drawWinningLine(winningCombination);
            return;
        }
        
        let roundDraw = !gameState.includes("");
        if (roundDraw) {
            statusDisplay.textContent = drawMessage();
            statusDisplay.setAttribute('aria-live', 'assertive');
            gameActive = false;
            showDraw();
            return;
        }
        
        // Mudar jogador
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusDisplay.textContent = currentPlayerTurn();
    }
    
    // Reinicia o jogo
    function handleResetGame() {
        gameActive = true;
        currentPlayer = "X";
        gameState = ["", "", "", "", "", "", "", "", ""];
        statusDisplay.textContent = currentPlayerTurn();
        statusDisplay.setAttribute('aria-live', 'polite');
        clearBoardEffects();
        
        cells.forEach(cell => {
            cell.textContent = "";
            cell.classList.remove('x', 'o', 'winner');
            cell.setAttribute('aria-label', `Célula ${parseInt(cell.getAttribute('data-index')) + 1}, vazia`);
        });

        // Se for modo CPU e o jogador atual é O (CPU), faz a primeira jogada
        if (gameMode === "cpu" && currentPlayer === "O") {
            setTimeout(makeCpuMove, 800);
        }
    }
    
    // Adiciona event listeners
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
        cell.addEventListener('keydown', handleCellKeyDown);
    });

    const modeButton = document.getElementById('mode-btn');

    modeButton.addEventListener('click', () => {
        gameMode = gameMode === "human" ? "cpu" : "human";
        modeButton.textContent = gameMode === "human" ? "2 Jogadores" : "1 Jogador";
        handleResetGame();
    });
    
    resetButton.addEventListener('click', handleResetGame);
});