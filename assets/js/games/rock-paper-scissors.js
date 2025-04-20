/**
 * Rock, Paper, Scissors Game
 * A classic game of chance against the computer.
 */

// Game state
const gameState = {
    playerScore: 0,
    computerScore: 0,
    choices: ['rock', 'paper', 'scissors'],
    winningCombinations: {
        rock: 'scissors',
        paper: 'rock',
        scissors: 'paper'
    }
};

// DOM Elements
const elements = {
    // Score displays
    playerScoreDisplay: document.getElementById('player-score'),
    computerScoreDisplay: document.getElementById('computer-score'),
    
    // Message display
    gameMessage: document.getElementById('game-message'),
    
    // Choice displays
    playerChoiceDisplay: document.getElementById('player-choice'),
    computerChoiceDisplay: document.getElementById('computer-choice'),
    
    // Buttons
    rockButton: document.getElementById('rock'),
    paperButton: document.getElementById('paper'),
    scissorsButton: document.getElementById('scissors'),
    resetButton: document.getElementById('reset-score'),
    saveScoreButton: document.getElementById('save-score'),
    
    // Nickname
    nicknameInput: document.getElementById('player-nickname'),
    nicknameContainer: document.getElementById('nickname-container'),
    
    // Leaderboard
    leaderboardBody: document.getElementById('leaderboard-body'),
    noScoresMessage: document.getElementById('no-scores')
};

/**
 * Initialize the game
 */
function initGame() {
    // Add event listeners for choice buttons
    elements.rockButton.addEventListener('click', () => playRound('rock'));
    elements.paperButton.addEventListener('click', () => playRound('paper'));
    elements.scissorsButton.addEventListener('click', () => playRound('scissors'));
    
    // Add event listener for reset button
    elements.resetButton.addEventListener('click', resetScore);
    
    // Add event listener for save score button
    elements.saveScoreButton.addEventListener('click', saveScore);
    
    // Initially hide the nickname container
    elements.nicknameContainer.style.display = 'none';
    
    // Load leaderboard
    loadLeaderboard();
    
    // Initialize score displays
    updateScoreDisplay();
}

/**
 * Play a round of the game
 */
function playRound(playerChoice) {
    // Get computer's choice
    const computerChoice = getComputerChoice();
    
    // Display choices
    displayChoices(playerChoice, computerChoice);
    
    // Determine winner
    const result = determineWinner(playerChoice, computerChoice);
    
    // Update score
    updateScore(result);
    
    // Display result message
    displayResultMessage(result, playerChoice, computerChoice);
    
    // Check if nickname container should be shown
    if (gameState.playerScore >= 5 || gameState.computerScore >= 5) {
        elements.nicknameContainer.style.display = 'block';
    }
}

/**
 * Get a random choice for the computer
 */
function getComputerChoice() {
    const randomIndex = Math.floor(Math.random() * gameState.choices.length);
    return gameState.choices[randomIndex];
}

/**
 * Display the player and computer choices
 */
function displayChoices(playerChoice, computerChoice) {
    // Update player choice display
    elements.playerChoiceDisplay.innerHTML = `<i class="fas fa-hand-${playerChoice}"></i>`;
    
    // Create animation effect for computer choice
    elements.computerChoiceDisplay.innerHTML = `<i class="fas fa-question"></i>`;
    elements.computerChoiceDisplay.classList.add('animate-pulse');
    
    // After a brief delay, show computer's choice
    setTimeout(() => {
        elements.computerChoiceDisplay.classList.remove('animate-pulse');
        elements.computerChoiceDisplay.innerHTML = `<i class="fas fa-hand-${computerChoice}"></i>`;
    }, 500);
}

/**
 * Determine the winner of the round
 */
function determineWinner(playerChoice, computerChoice) {
    // If choices are the same, it's a tie
    if (playerChoice === computerChoice) {
        return 'tie';
    }
    
    // If player's choice beats computer's choice, player wins
    if (gameState.winningCombinations[playerChoice] === computerChoice) {
        return 'player';
    }
    
    // Otherwise, computer wins
    return 'computer';
}

/**
 * Update the score based on the result
 */
function updateScore(result) {
    if (result === 'player') {
        gameState.playerScore++;
    } else if (result === 'computer') {
        gameState.computerScore++;
    }
    
    updateScoreDisplay();
}

/**
 * Update the score display
 */
function updateScoreDisplay() {
    elements.playerScoreDisplay.textContent = gameState.playerScore;
    elements.computerScoreDisplay.textContent = gameState.computerScore;
}

/**
 * Display the result message
 */
function displayResultMessage(result, playerChoice, computerChoice) {
    let message = '';
    
    switch (result) {
        case 'player':
            message = `You win! ${capitalizeFirstLetter(playerChoice)} beats ${capitalizeFirstLetter(computerChoice)}.`;
            elements.gameMessage.className = 'game-message success';
            break;
        case 'computer':
            message = `You lose! ${capitalizeFirstLetter(computerChoice)} beats ${capitalizeFirstLetter(playerChoice)}.`;
            elements.gameMessage.className = 'game-message error';
            break;
        case 'tie':
            message = `It's a tie! Both chose ${capitalizeFirstLetter(playerChoice)}.`;
            elements.gameMessage.className = 'game-message';
            break;
    }
    
    elements.gameMessage.textContent = message;
}

/**
 * Reset the score
 */
function resetScore() {
    gameState.playerScore = 0;
    gameState.computerScore = 0;
    updateScoreDisplay();
    
    elements.gameMessage.textContent = 'Score reset! Choose your weapon!';
    elements.gameMessage.className = 'game-message';
    
    elements.playerChoiceDisplay.innerHTML = `<i class="fas fa-question"></i>`;
    elements.computerChoiceDisplay.innerHTML = `<i class="fas fa-question"></i>`;
    
    elements.nicknameContainer.style.display = 'none';
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
    
    // Create score object
    const score = {
        nickname: nickname,
        wins: gameState.playerScore,
        date: new Date().toLocaleDateString()
    };
    
    // Get existing scores from localStorage
    let scores = JSON.parse(localStorage.getItem('rpsScores')) || [];
    
    // Add new score
    scores.push(score);
    
    // Sort scores by wins (descending) and date (descending)
    scores.sort((a, b) => {
        if (a.wins === b.wins) {
            return new Date(b.date) - new Date(a.date);
        }
        return b.wins - a.wins;
    });
    
    // Keep only top 10 scores
    scores = scores.slice(0, 10);
    
    // Save to localStorage
    localStorage.setItem('rpsScores', JSON.stringify(scores));
    
    // Update leaderboard
    loadLeaderboard();
    
    // Show success message
    elements.saveScoreButton.disabled = true;
    elements.saveScoreButton.textContent = 'Score Saved!';
    
    // Reset button after delay
    setTimeout(() => {
        elements.saveScoreButton.disabled = false;
        elements.saveScoreButton.textContent = 'Save Score';
    }, 2000);
}

/**
 * Load and display leaderboard
 */
function loadLeaderboard() {
    // Get scores from localStorage
    const scores = JSON.parse(localStorage.getItem('rpsScores')) || [];
    
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
                <td>${score.wins}</td>
                <td>${score.date}</td>
            `;
            elements.leaderboardBody.appendChild(row);
        });
    }
}

/**
 * Helper function to capitalize the first letter of a string
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);