function getNextPlayerNumber() {
    let globalStats = JSON.parse(localStorage.getItem('globalGameStats')) || { totalGamesPlayed: 0 };
    return globalStats.totalGamesPlayed + 1;
}

function getPlayerName() {
    const playerNumber = getNextPlayerNumber();
    return `player_${String(playerNumber).padStart(3, '0')}`;
}

function incrementGamesPlayed() {
    let globalStats = JSON.parse(localStorage.getItem('globalGameStats')) || { totalGamesPlayed: 0 };
    globalStats.totalGamesPlayed++;
    localStorage.setItem('globalGameStats', JSON.stringify(globalStats));
}

// This function is now called from game.js at the end of a game.