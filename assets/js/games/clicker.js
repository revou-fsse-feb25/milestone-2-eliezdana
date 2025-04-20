/**
 * Clicker Game
 * A game where the player clicks a button as many times as possible within a time limit.
 */

// Game state
const gameState = {
    score: 0,
    timeLeft: 30,
    maxTime: 30,
    timer: null,
    isGameActive: false,
    startTime: null,
    clicks: []
};

// DOM Elements
const elements = {
    // Game screens
    gameStartScreen: document.getElementById('game-start-screen'),
    gamePlayScreen: document.getElementById('game-play-screen'),
    gameEndScreen: document.getElementById('game-end-screen'),
    
    // Buttons
    startGameBtn: document.getElementById('start-game'),
    clickButton: document.getElementById('click-button'),
    playAgainBtn: document.getElementById('play-again'),
    saveScoreBtn: document.getElementById('save-score'),
    
    // Game play elements
    timeLeftDisplay: document.getElementById('time-left'),
    timeProgress: document.getElementById('time-progress'),
    clickScoreDisplay: document.getElementById('click-score'),
    clicksPerSecondDisplay: document.getElementById('clicks-per-second'),
    
    // Game end elements
    finalScoreDisplay: document.getElementById('final-score'),
    finalCpsDisplay: document.getElementById('final-cps'),
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
    elements.clickButton.addEventListener('click', handleClick);
    elements.playAgainBtn.addEventListener('click', resetGame);
    elements.saveScoreBtn.addEventListener('click', saveScore);
    
    // Load leaderboard
    loadLeaderboard();
}

/**
 * Start a new game
 */
function startGame() {
    // Reset game state
    gameState.score = 0;
    gameState.timeLeft = gameState.maxTime;
    gameState.isGameActive = true;
    gameState.startTime = Date.now();
    gameState.clicks = [];
    
    // Update UI
    elements.clickScoreDisplay.textContent = gameState.score;
    elements.timeLeftDisplay.textContent = gameState.timeLeft;
    elements.timeProgress.style.width = '100%';
    elements.clicksPerSecondDisplay.textContent = '0.0';
    
    // Show game play screen
    showScreen('play');
    
    // Start timer
    gameState.timer = setInterval(updateTimer, 1000);
    
    // Add click to track clicks per second
    window.requestAnimationFrame(updateClicksPerSecond);
}

/**
 * Handle button click
 */
function handleClick() {
    if (!gameState.isGameActive) return;
    
    // Increment score
    gameState.score++;
    
    // Record click timestamp for CPS calculation
    gameState.clicks.push(Date.now());
    
    // Update UI
    elements.clickScoreDisplay.textContent = gameState.score;
    
    // Add animation effect
    elements.clickButton.classList.add('animate-pulse');
    setTimeout(() => elements.clickButton.classList.remove('animate-pulse'), 100);
}

/**
 * Update the timer
 */
function updateTimer() {
    gameState.timeLeft--;
    
    // Update UI
    elements.timeLeftDisplay.textContent = gameState.timeLeft;
    const progressPercentage = (gameState.timeLeft / gameState.maxTime) * 100;
    elements.timeProgress.style.width = `${progressPercentage}%`;
    
    // Add warning colors as time runs out
    if (gameState.timeLeft <= 5) {
        elements.timeProgress.style.backgroundColor = '#e74c3c';
    } else if (gameState.timeLeft <= 10) {
        elements.timeProgress.style.backgroundColor = '#f39c12';
    }
    
    // Check if game is over
    if (gameState.timeLeft <= 0) {
        endGame();
    }
}

/**
 * Update clicks per second calculation
 */
function updateClicksPerSecond() {
    if (!gameState.isGameActive) return;
    
    // Only consider clicks in the last second
    const now = Date.now();
    const recentClicks = gameState.clicks.filter(timestamp => now - timestamp < 1000);
    
    // Calculate clicks per second
    const cps = recentClicks.length;
    
    // Update UI with one decimal place
    elements.clicksPerSecondDisplay.textContent = cps.toFixed(1);
    
    // Continue updating
    window.requestAnimationFrame(updateClicksPerSecond);
}

/**
 * End the game
 */
function endGame() {
    gameState.isGameActive = false;
    
    // Clear timer
    clearInterval(gameState.timer);
    
    // Calculate final statistics
    const totalTime = (Date.now() - gameState.startTime) / 1000;
    const finalCps = (gameState.score / totalTime).toFixed(1);
    
    // Update UI for game end screen
    elements.finalScoreDisplay.textContent = gameState.score;
    elements.finalCpsDisplay.textContent = finalCps;
    
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
    
    // Calculate final CPS
    const totalTime = (Date.now() - gameState.startTime) / 1000;
    const finalCps = (gameState.score / totalTime).toFixed(1);
    
    // Create score object
    const score = {
        nickname: nickname,
        clicks: gameState.score,
        cps: finalCps,
        date: new Date().toLocaleDateString()
    };
    
    // Get existing scores from localStorage
    let scores = JSON.parse(localStorage.getItem('clickerScores')) || [];
    
    // Add new score
    scores.push(score);
    
    // Sort scores by clicks (descending) and date (descending)
    scores.sort((a, b) => {
        if (a.clicks === b.clicks) {
            return new Date(b.date) - new Date(a.date);
        }
        return b.clicks - a.clicks;
    });
    
    // Keep only top 10 scores
    scores = scores.slice(0, 10);
    
    // Save to localStorage
    localStorage.setItem('clickerScores', JSON.stringify(scores));
    
    // Update leaderboard
    loadLeaderboard();
    
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
function loadLeaderboard() {
    // Get scores from localStorage
    const scores = JSON.parse(localStorage.getItem('clickerScores')) || [];
    
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
                <td>${score.clicks}</td>
                <td>${score.cps}</td>
                <td>${score.date}</td>
            `;
            elements.leaderboardBody.appendChild(row);
        });
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);