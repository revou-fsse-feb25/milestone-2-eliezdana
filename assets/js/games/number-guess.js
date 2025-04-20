/**
 * Number Guessing Game
 * A simple game where the player tries to guess a random number between 1 and 100.
 */

// Game state
const gameState = {
    secretNumber: null,
    attemptsLeft: 5,
    maxAttempts: 5,
    previousGuesses: [],
    isGameActive: false
};

// DOM Elements
const elements = {
    // Game screens
    gameStartScreen: document.getElementById('game-start-screen'),
    gamePlayScreen: document.getElementById('game-play-screen'),
    gameEndScreen: document.getElementById('game-end-screen'),
    
    // Buttons
    startGameBtn: document.getElementById('start-game'),
    submitGuessBtn: document.getElementById('submit-guess'),
    playAgainBtn: document.getElementById('play-again'),
    saveScoreBtn: document.getElementById('save-score'),
    
    // Game play elements
    guessInput: document.getElementById('guess'),
    attemptsDisplay: document.getElementById('attempts'),
    hintMessage: document.getElementById('hint-message'),
    guessHistory: document.getElementById('guess-history'),
    
    // Game end elements
    resultMessage: document.getElementById('result-message'),
    correctNumber: document.getElementById('correct-number'),
    attemptsTaken: document.getElementById('attempts-taken'),
    nicknameInput: document.getElementById('player-nickname'),
    
    // Leaderboard
    leaderboardBody: document.getElementById('leaderboard-body'),
    noScoresMessage: document.getElementById('no-scores')
};

/**
 * Initialize the game
 */
function initGame() {
    // Add event listeners
    elements.startGameBtn.addEventListener('click', startGame);
    elements.submitGuessBtn.addEventListener('click', handleGuess);
    elements.playAgainBtn.addEventListener('click', resetGame);
    elements.saveScoreBtn.addEventListener('click', saveScore);
    
    // Enter key to submit guess
    elements.guessInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter' && gameState.isGameActive) {
            handleGuess();
        }
    });
    
    // Load leaderboard
    loadLeaderboard();
}

/**
 * Generate a random number between min and max (inclusive)
 */
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Start a new game
 */
function startGame() {
    // Reset game state
    gameState.secretNumber = getRandomNumber(1, 100);
    gameState.attemptsLeft = gameState.maxAttempts;
    gameState.previousGuesses = [];
    gameState.isGameActive = true;
    
    // Update UI
    elements.attemptsDisplay.textContent = gameState.attemptsLeft;
    elements.hintMessage.textContent = 'Make your first guess!';
    elements.guessHistory.textContent = '';
    
    // Show game play screen
    showScreen('play');
    
    // Focus on input
    elements.guessInput.focus();
    
    // Log for debugging (remove in production)
    // console.log(`Game started! Secret number: ${gameState.secretNumber}`);
}

/**
 * Handle player's guess
 */
function handleGuess() {
    if (!gameState.isGameActive) return;
    
    const guess = parseInt(elements.guessInput.value);
    
    // Validate input
    if (isNaN(guess) || guess < 1 || guess > 100) {
        elements.hintMessage.textContent = 'Please enter a valid number between 1 and 100.';
        elements.hintMessage.classList.add('animate-shake');
        setTimeout(() => elements.hintMessage.classList.remove('animate-shake'), 500);
        return;
    }
    
    // Update game state
    gameState.attemptsLeft--;
    gameState.previousGuesses.push(guess);
    
    // Update UI
    elements.attemptsDisplay.textContent = gameState.attemptsLeft;
    elements.guessHistory.textContent = gameState.previousGuesses.join(', ');
    elements.guessInput.value = '';
    elements.guessInput.focus();
    
    // Check guess
    if (guess === gameState.secretNumber) {
        // Player wins
        endGame(true);
    } else {
        // Provide hint
        const hint = guess < gameState.secretNumber ? 'Too low!' : 'Too high!';
        elements.hintMessage.textContent = hint;
        
        // Check if out of attempts
        if (gameState.attemptsLeft === 0) {
            endGame(false);
        }
    }
}

/**
 * End the game
 */
function endGame(isWin) {
    gameState.isGameActive = false;
    
    // Update UI for game end screen
    elements.correctNumber.textContent = gameState.secretNumber;
    
    const attemptsTaken = gameState.maxAttempts - gameState.attemptsLeft;
    const attemptWord = attemptsTaken === 1 ? 'attempt' : 'attempts';
    
    if (isWin) {
        elements.resultMessage.textContent = 'Congratulations! You won! 🎉';
        elements.resultMessage.className = 'success';
        elements.attemptsTaken.textContent = `You found the number in ${attemptsTaken} ${attemptWord}.`;
    } else {
        elements.resultMessage.textContent = 'Game Over! Better luck next time! 😢';
        elements.resultMessage.className = 'failure';
        elements.attemptsTaken.textContent = `You used all ${gameState.maxAttempts} attempts.`;
    }
    
    // Show end screen
    showScreen('end');
}

/**
 * Reset game to initial state
 */
function resetGame() {
    // Hide end screen and show start screen
    showScreen('start');
    
    // Clear input
    elements.guessInput.value = '';
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
    
    const attemptsTaken = gameState.maxAttempts - gameState.attemptsLeft;
    
    // Create score object
    const score = {
        nickname: nickname,
        attempts: gameState.isGameActive ? 0 : attemptsTaken,
        date: new Date().toLocaleDateString()
    };
    
    // Get existing scores from localStorage
    let scores = JSON.parse(localStorage.getItem('numberGuessScores')) || [];
    
    // Add new score
    scores.push(score);
    
    // Sort scores by attempts (ascending) and date (descending)
    scores.sort((a, b) => {
        if (a.attempts === b.attempts) {
            return new Date(b.date) - new Date(a.date);
        }
        return a.attempts - b.attempts;
    });
    
    // Keep only top 10 scores
    scores = scores.slice(0, 10);
    
    // Save to localStorage
    localStorage.setItem('numberGuessScores', JSON.stringify(scores));
    
    // Update leaderboard
    loadLeaderboard();
    
    // Show success message
    elements.saveScoreBtn.disabled = true;
    elements.saveScoreBtn.textContent = 'Score Saved!';
    
    // Disable save button to prevent duplicate entries
    setTimeout(() => {
        elements.saveScoreBtn.disabled = false;
        elements.saveScoreBtn.textContent = 'Save Score';
    }, 2000);
}

/**
 * Load and display leaderboard
 */
function loadLeaderboard() {
    // Get scores from localStorage
    const scores = JSON.parse(localStorage.getItem('numberGuessScores')) || [];
    
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
                <td>${score.attempts}</td>
                <td>${score.date}</td>
            `;
            elements.leaderboardBody.appendChild(row);
        });
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);