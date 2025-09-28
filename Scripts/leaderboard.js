document.addEventListener('DOMContentLoaded', () => {
    const leaderboardList = document.getElementById('leaderboard-list');
    const finalScoreDisplay = document.getElementById('final-score');

    async function initializeLeaderboard() {
        let highScores = JSON.parse(localStorage.getItem('highScores'));

        if (!highScores) {
            try {
                const res = await fetch('../Database/leaderboard-database.json');
                if (res.ok) {
                    const data = await res.json();
                    highScores = data.highScores || [];
                    localStorage.setItem('highScores', JSON.stringify(highScores));
                } else {
                    highScores = [];
                }
            } catch (error) {
                console.error("Could not load default leaderboard:", error);
                highScores = [];
            }
        }
        
        renderLeaderboard(highScores);
    }

    function renderLeaderboard(scores) {
        if(leaderboardList){
            leaderboardList.innerHTML = scores
                .map(score => {
                    return `<li class="high-score"><span>${score.name}</span><span>${score.score}</span></li>`;
                })
                .join('');
        }
    }

    // For leaderboard page
    if (leaderboardList) {
        initializeLeaderboard();
    }

    // For result page - auto save score
    if (finalScoreDisplay) {
        const mostRecentScore = localStorage.getItem('mostRecentScore') || 0;
        const playerName = localStorage.getItem('playerName') || 'Player';
        finalScoreDisplay.innerText = mostRecentScore;
        
        if(mostRecentScore > 0) { // Only save scores greater than 0
            saveScore(playerName, mostRecentScore);
        }

        // Also trigger confetti and sounds from main.js
    }
});

function saveScore(name, score) {
    let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    const newScore = {
        score: parseInt(score, 10),
        name: name
    };

    // Prevent duplicate scores for the same player in the same session
    const existingScoreIndex = highScores.findIndex(s => s.name === name && s.score === newScore.score);
    if (existingScoreIndex > -1) {
        return; // Score already saved
    }

    highScores.push(newScore);
    highScores.sort((a, b) => b.score - a.score); // Sort descending
    highScores.splice(10); // Keep only top 10

    localStorage.setItem('highScores', JSON.stringify(highScores));
}
