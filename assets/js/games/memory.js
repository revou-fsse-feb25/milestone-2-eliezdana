/**
 * Memory Card Game
 * A game where the player needs to match pairs of cards.
 */

// Game state
const gameState = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: 0,
    moves: 0,
    startTime: null,
    timerInterval: null,
    isGameActive: false,
    difficulty: 'easy',
    gridSizes: {
        easy: { rows: 3, cols: 4 },    // 12 cards (6 pairs)
        medium: { rows: 4, cols: 4 },  // 16 cards (8 pairs)
        hard: { rows: 4, cols: 6 }     // 24 cards (12 pairs)
    },
    symbols: [
        'fas fa-heart', 'fas fa-star', 'fas fa-bell', 'fas fa-moon', 'fas fa-sun', 'fas fa-bolt',
        'fas fa-apple-alt', 'fas fa-bomb', 'fas fa-car', 'fas fa-key', 'fas fa-gift', 'fas fa-crown',
        'fas fa-fish', 'fas fa-dragon', 'fas fa-chess-knight', 'fas fa-ghost', 'fas fa-snowflake', 'fas fa-leaf'
    ]
};

// DOM Elements
const elements = {
    // Game screens
    gameStartScreen: document.getElementById('game-start-screen'),
    gamePlayScreen: document.getElementById('game-play-screen'),
    gameEndScreen: document.getElementById('game-end-screen'),
    
    // Buttons
    difficultyButtons: document.querySelectorAll('.difficulty-btn'),
    startGameBtn: document.getElementById('start-game'),
    playAgainBtn: document.getElementById('play-again'),
    saveScoreBtn: document.getElementById('save-score'),
    
    // Game play elements
    memoryGrid: document.getElementById('memory-grid'),
    movesCount: document.getElementById('moves-count'),
    timeElapsed: document.getElementById('time-elapsed'),
    
    // Game end elements
    finalMoves: document.getElementById('final-moves'),
    finalTime: document.getElementById('final-time'),
    nicknameInput: document.getElementById('player-nickname'),
    
    // Leaderboard
    leaderboardTabs: document.querySelectorAll('.leaderboard-tab'),
    leaderboardBody: document.getElementById('leaderboard-body'),
    noScoresMessage: document.getElementById('no-scores')
};

/**
 * Initialize the game
 */
function initGame() {
    // Add event listeners for buttons
    elements.difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            setDifficulty(button.dataset.difficulty);
        });
    });
    
    elements.startGameBtn.addEventListener('click', startGame);
    elements.playAgainBtn.addEventListener('click', resetGame);
    elements.saveScoreBtn.addEventListener('click', saveScore);
    
    // Add event listeners for leaderboard tabs
    elements.leaderboardTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            setLeaderboardTab(tab.dataset.difficulty);
        });
    });
    
    // Set default difficulty
    setDifficulty('easy');
    
    // Load leaderboard
    loadLeaderboard('easy');
}

/**
 * Set the game difficulty
 */
function setDifficulty(difficulty) {
    gameState.difficulty = difficulty;
    
    // Update UI
    elements.difficultyButtons.forEach(button => {
        if (button.dataset.difficulty === difficulty) {
            button.classList.add('btn-primary');
            button.classList.remove('btn-secondary');
        } else {
            button.classList.add('btn-secondary');
            button.classList.remove('btn-primary');
        }
    });
}

/**
 * Set the active leaderboard tab
 */
function setLeaderboardTab(difficulty) {
    // Update UI
    elements.leaderboardTabs.forEach(tab => {
        if (tab.dataset.difficulty === difficulty) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Load leaderboard for selected difficulty
    loadLeaderboard(difficulty);
}

/**
 * Start a new game
 */
function startGame() {
    // Reset game state
    gameState.flippedCards = [];
    gameState.matchedPairs = 0;
    gameState.moves = 0;
    gameState.isGameActive = true;
    
    // Calculate total pairs based on difficulty
    const { rows, cols } = gameState.gridSizes[gameState.difficulty];
    gameState.totalPairs = (rows * cols) / 2;
    
    // Generate cards
    generateCards();
    
    // Update UI
    elements.movesCount.textContent = gameState.moves;
    elements.timeElapsed.textContent = '00:00';
    
    // Show game play screen
    showScreen('play');
    
    // Start timer
    gameState.startTime = Date.now();
    gameState.timerInterval = setInterval(updateTimer, 1000);
}

/**
 * Generate cards for the memory grid
 */
function generateCards() {
    // Clear existing grid
    elements.memoryGrid.innerHTML = '';
    
    // Get grid size based on difficulty
    const { rows, cols } = gameState.gridSizes[gameState.difficulty];
    const totalCards = rows * cols;
    const totalPairs = totalCards / 2;
    
    // Create array of symbols for pairs
    const symbols = [...gameState.symbols.slice(0, totalPairs)];
    
    // Create array with each symbol appearing twice
    gameState.cards = [...symbols, ...symbols];
    
    // Shuffle the cards
    shuffleArray(gameState.cards);
    
    // Set grid styling based on difficulty
    elements.memoryGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    elements.memoryGrid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    
    // Add cards to the grid
    gameState.cards.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <i class="fas fa-question"></i>
                </div>
                <div class="card-back">
                    <i class="${symbol}"></i>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => flipCard(card, index));
        elements.memoryGrid.appendChild(card);
    });
}

/**
 * Flip a card
 */
function flipCard(card, index) {
    // Ignore if the game is not active, the card is already flipped, or it's a matched card
    if (!gameState.isGameActive || 
        gameState.flippedCards.some(c => c.index === index) || 
        card.classList.contains('matched')) {
        return;
    }
    
    // Flip the card
    card.classList.add('flipped');
    
    // Add to flipped cards
    gameState.flippedCards.push({ card, index, symbol: gameState.cards[index] });
    
    // If we have 2 flipped cards, check for a match
    if (gameState.flippedCards.length === 2) {
        // Increment moves
        gameState.moves++;
        elements.movesCount.textContent = gameState.moves;
        
        // Disable further flips while checking
        gameState.isGameActive = false;
        
        // Check for a match
        setTimeout(checkForMatch, 500);
    }
}

/**
 * Check if the two flipped cards match
 */
function checkForMatch() {
    const [card1, card2] = gameState.flippedCards;
    
    if (card1.symbol === card2.symbol) {
        // Match found
        card1.card.classList.add('matched');
        card2.card.classList.add('matched');
        
        // Increment matched pairs
        gameState.matchedPairs++;
        
        // Check if all pairs are matched
        if (gameState.matchedPairs === gameState.totalPairs) {
            endGame();
            return;
        }
    } else {
        // No match, flip cards back
        card1.card.classList.remove('flipped');
        card2.card.classList.remove('flipped');
    }
    
    // Clear flipped cards
    gameState.flippedCards = [];
    
    // Re-enable card flipping
    gameState.isGameActive = true;
}

/**
 * Update the timer display
 */
function updateTimer() {
    if (!gameState.isGameActive) return;
    
    const elapsedSeconds = Math.floor((Date.now() - gameState.startTime) / 1000);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    
    elements.timeElapsed.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * End the game
 */
function endGame() {
    gameState.isGameActive = false;
    
    // Stop timer
    clearInterval(gameState.timerInterval);
    
    // Calculate final time
    const elapsedSeconds = Math.floor((Date.now() - gameState.startTime) / 1000);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const finalTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // Update UI for game end screen
    elements.finalMoves.textContent = gameState.moves;
    elements.finalTime.textContent = finalTime;
    
    // Show end screen
    showScreen('end');
}

/**
 * Reset game to initial state
 */
function resetGame() {
    // Stop timer
    clearInterval(gameState.timerInterval);
    
    // Hide end screen and show start screen
    showScreen('start');
    
    // Clear input
    elements.nicknameInput.value = '';
}

/**
 * Show specified game screen
 */
function showScreen(screen) {
    // Hide all screens
    elements.gameStartScreen.classList.remove('active');
    elements.gamePlayScreen.classList.remove('active');
    elements.gameEndScreen.classList.remove('active');
    
    // Show requested screen
    switch (screen) {
        case 'start':
            elements.gameStartScreen.classList.add('active');
            break;
        case 'play':
            elements.gamePlayScreen.classList.add('active');
            break;
        case 'end':
            elements.gameEndScreen.classList.add('active');
            break;
    }
}

/**
 * Save player score to leaderboard
 */
function saveScore() {
    const nickname = elements.nicknameInput.value.trim();
    
    if (!nickname) {
        alert('Please enter your nickname to save your score.');
        return;
    }
    
    // Calculate final time
    const elapsedSeconds = Math.floor((Date.now() - gameState.startTime) / 1000);
    const finalTime = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:${String(elapsedSeconds % 60).padStart(2, '0')}`;
    
    // Create score object
    const score = {
        nickname: nickname,
        moves: gameState.moves,
        time: finalTime,
        timeInSeconds: elapsedSeconds,
        date: new Date().toLocaleDateString(),
        difficulty: gameState.difficulty
    };
    
    // Get existing scores from localStorage
    const storageKey = `memoryScores_${gameState.difficulty}`;
    let scores = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    // Add new score
    scores.push(score);
    
    // Sort scores by moves (ascending) and time (ascending)
    scores.sort((a, b) => {
        if (a.moves === b.moves) {
            return a.timeInSeconds - b.timeInSeconds;
        }
        return a.moves - b.moves;
    });
    
    // Keep only top 10 scores
    scores = scores.slice(0, 10);
    
    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(scores));
    
    // Update leaderboard
    loadLeaderboard(gameState.difficulty);
    
    // Show success message
    elements.saveScoreBtn.disabled = true;
    elements.saveScoreBtn.textContent = 'Score Saved!';
    
    // Reset button after delay
    setTimeout(() => {
        elements.saveScoreBtn.disabled = false;
        elements.saveScoreBtn.textContent = 'Save Score';
    }, 2000);
}

/**
 * Load and display leaderboard
 */
function loadLeaderboard(difficulty) {
    // Get scores from localStorage
    const storageKey = `memoryScores_${difficulty}`;
    const scores = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    // Clear leaderboard
    elements.leaderboardBody.innerHTML = '';
    
    if (scores.length === 0) {
        // Show "no scores" message
        elements.noScoresMessage.style.display = 'block';
    } else {
        // Hide "no scores" message
        elements.noScoresMessage.style.display = 'none';
        
        // Add scores to leaderboard
        scores.forEach((score, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${score.nickname}</td>
                <td>${score.moves}</td>
                <td>${score.time}</td>
                <td>${score.date}</td>
            `;
            elements.leaderboardBody.appendChild(row);
        });
    }
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);