document.addEventListener('DOMContentLoaded', () => {
    // Logic for the result page
    if (document.body.classList.contains('result-background')) {
        const finalScore = localStorage.getItem('mostRecentScore') || 0;
        const questionsAttempted = localStorage.getItem('questionsAttempted') || 0;
        const totalQuestions = localStorage.getItem('totalQuestions') || 10;
        
        document.getElementById('final-score').innerText = finalScore;
        document.getElementById('questions-attempted').innerText = questionsAttempted;
        document.getElementById('total-questions').innerText = totalQuestions;

        // Play sounds
        const resultSound = document.getElementById('result-sound');
        const confettiSound = document.getElementById('confetti-sound');
        if(resultSound) resultSound.play();
        if(confettiSound) confettiSound.play();

        // Trigger confetti
        if (typeof confetti === 'function') {
            const duration = 5 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            function randomInRange(min, max) {
                return Math.random() * (max - min) + min;
            }

            const interval = setInterval(function() {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);
        }

        // You can add logic here to fetch and display the player's rank

        // Set the 'Play Again' button's href dynamically
        const playAgainBtn = document.getElementById('play-again-btn');
        if (playAgainBtn) {
            // Get difficulty from URL params or default to easy
            const urlParams = new URLSearchParams(window.location.search);
            const difficulty = urlParams.get('difficulty') || 'easy';
            playAgainBtn.href = `game.html?difficulty=${difficulty}`;
        }

        // Display dynamic message based on score
        const resultTitle = document.querySelector('.result-title');
        if (resultTitle) {
            let message = 'Quiz Complete!';
            if (finalScore > 70) {
                message = 'Excellent Work!';
            } else if (finalScore > 40) {
                message = 'Good Job!';
            } else if (finalScore > 0) {
                message = 'Keep Practicing!';
            }
            resultTitle.innerText = message;
        }
    }

    // Sound for all clicks
    const clickSound = new Audio('Sounds/click.mp3');
    document.body.addEventListener('click', () => {
        clickSound.play();
    });

    // Sound for navigation buttons only
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            clickSound.currentTime = 0;
            clickSound.play();
        });
    });
});
