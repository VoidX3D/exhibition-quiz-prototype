
document.addEventListener('DOMContentLoaded', () => {
    const questionText = document.getElementById('question-text');
    const answerButtons = Array.from(document.getElementsByClassName('answer-btn'));
    const scoreText = document.getElementById('score');
    const timerFg = document.querySelector('.timer-fg');
    const timerText = document.getElementById('timer-text');
    const questionCounter = document.getElementById('question-counter');
    const feedbackIndicator = document.getElementById('feedback-indicator');
    const playerNameDisplay = document.getElementById('player-name-display');
    const correctSound = document.getElementById('correct-sound');
    const wrongSound = document.getElementById('wrong-sound');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const gameContainer = document.getElementById('game-container');
    const clickSound = new Audio('Sounds/click.mp3');

    let gameState = {};

    const SCORE_MULTIPLIERS = {
        easy: 1,
        medium: 2.5,
        nightmare: 5
    };
    const MAX_QUESTIONS = 10;
    const TIME_PER_QUESTION = 30;

    const urlParams = new URLSearchParams(window.location.search);
    const difficulty = urlParams.get('difficulty') || 'easy';

    async function initGame() {
        const savedState = JSON.parse(localStorage.getItem('gameState'));
        if (savedState && savedState.difficulty === difficulty && confirm("Resume previous game?")) {
            gameState = savedState;
            playerNameDisplay.innerText = localStorage.getItem('playerName') || getPlayerName(difficulty);
            scoreText.innerText = gameState.score;
            startGame();
        } else {
            localStorage.removeItem('gameState');
            await loadNewGame();
        }
    }

    async function loadNewGame() {
        try {
            let allQuestions = [];
            for (let i = 1; i <= 10; i++) {
                const res = await fetch(`../Difficulty/${difficulty}/game_${difficulty}_${i}.json`);
                if (res.ok) {
                    allQuestions = allQuestions.concat(await res.json());
                } else {
                    break;
                }
            }

            gameState = {
                questions: allQuestions.sort(() => Math.random() - 0.5).slice(0, MAX_QUESTIONS),
                score: 0,
                questionIndex: 0,
                difficulty: difficulty,
                playerName: getPlayerName() // Use new function
            };
            
            localStorage.setItem('playerName', gameState.playerName);
            playerNameDisplay.innerText = gameState.playerName;
            scoreText.innerText = '0';
            startGame();

        } catch (err) {
            console.error("Failed to load questions:", err);
            questionText.innerText = "Failed to load questions. Please ensure you are running this from a local server.";
        }
    }

    function startGame() {
        if (gameState.questions && gameState.questions.length > 0) {
            document.body.classList.add(difficulty);
            getNewQuestion();
        } else {
            questionText.innerText = "No questions found for this difficulty.";
        }
    }

    function getNewQuestion() {
        if (gameState.questionIndex >= gameState.questions.length) {
            return endGame();
        }

        questionCounter.innerText = `Question ${gameState.questionIndex + 1}/${gameState.questions.length}`;
        const currentQuestion = gameState.questions[gameState.questionIndex];
        questionText.innerText = currentQuestion.question;

        // Create shuffled answer order with correct answer tracking
        const shuffledAnswers = shuffleArray(currentQuestion.answers);
        const correctAnswerText = currentQuestion.answers[currentQuestion.correctAnswer];
        const newCorrectIndex = shuffledAnswers.indexOf(correctAnswerText);
        
        // Store the new correct index for this question
        gameState.currentCorrectIndex = newCorrectIndex;

        // Shuffle the button order as well
        const shuffledButtons = shuffleArray([...answerButtons]);
        
        answerButtons.forEach((btn, index) => {
            const answerSpan = btn.querySelector('span');
            answerSpan.innerText = shuffledAnswers[index];
            // Update the data-choice attribute to match the new position
            btn.setAttribute('data-choice', index);
        });

        gameState.acceptingAnswers = true;
        saveGameState();
        resetTimer();
        startTimer();
    }

    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    let timerId;
    function startTimer() {
        let timeLeft = TIME_PER_QUESTION;
        const circumference = 2 * Math.PI * 45;
        timerFg.style.strokeDashoffset = 0;

        timerId = setInterval(() => {
            timeLeft -= 0.1;
            timerText.innerText = Math.ceil(timeLeft);
            const offset = circumference - (timeLeft / TIME_PER_QUESTION) * circumference;
            timerFg.style.strokeDashoffset = offset;

            if (timeLeft <= 0) {
                clearInterval(timerId);
                handleAnswer(null); // Timeout
            }
        }, 100);
    }

    function resetTimer() {
        clearInterval(timerId);
        timerText.innerText = TIME_PER_QUESTION;
        timerFg.style.strokeDashoffset = 283;
    }

    function handleAnswer(selectedChoice) {
        if (!gameState.acceptingAnswers) return;
        gameState.acceptingAnswers = false;
        clearInterval(timerId);

        const currentQuestion = gameState.questions[gameState.questionIndex];
        // Use the shuffled correct index instead of original
        const isCorrect = selectedChoice !== null && selectedChoice.dataset['choice'] == gameState.currentCorrectIndex;

        if (isCorrect) {
            const timeBonus = Math.floor((parseInt(timerText.innerText) / TIME_PER_QUESTION) * 10);
            const difficultyMultiplier = SCORE_MULTIPLIERS[difficulty];
            gameState.score += (10 + timeBonus) * difficultyMultiplier;
            scoreText.innerText = gameState.score;
            if(correctSound) correctSound.play();
        } else {
            if(wrongSound) wrongSound.play();
        }

        const feedbackText = isCorrect ? 'Correct!' : 'Wrong!';
        feedbackIndicator.innerText = feedbackText;
        feedbackIndicator.classList.add(isCorrect ? 'correct' : 'wrong');
        feedbackIndicator.style.display = 'flex';

        if (selectedChoice) {
            selectedChoice.classList.add(isCorrect ? 'correct' : 'wrong');
        }

        setTimeout(() => {
            feedbackIndicator.style.display = 'none';
            feedbackIndicator.classList.remove('correct', 'wrong');
            if (selectedChoice) {
                selectedChoice.classList.remove('correct', 'wrong');
            }
            gameState.questionIndex++;
            getNewQuestion();
        }, 1500);
    }

    function saveGameState() {
        localStorage.setItem('gameState', JSON.stringify(gameState));
    }

    function endGame() {
        incrementGamesPlayed(); // Use new function
        localStorage.setItem('mostRecentScore', gameState.score);
        localStorage.setItem('questionsAttempted', gameState.questionIndex);
        localStorage.setItem('totalQuestions', gameState.questions.length);
        localStorage.removeItem('gameState');
        window.location.assign('result.html');
    }

    // Attach event listeners directly to the original answerButtons
    answerButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            clickSound.currentTime = 0;
            clickSound.volume = 0.25;
            clickSound.play();
        });
        button.addEventListener('click', e => {
            clickSound.currentTime = 0;
            clickSound.volume = 0.5;
            clickSound.play();
            handleAnswer(e.currentTarget);
        });
    });

    document.getElementById('quit-btn').addEventListener('click', () => {
        // Calculate results and go directly to result page
        incrementGamesPlayed();
        localStorage.setItem('mostRecentScore', gameState.score);
        localStorage.setItem('questionsAttempted', gameState.questionIndex);
        localStorage.setItem('totalQuestions', gameState.questions.length);
        localStorage.removeItem('gameState');
        window.location.assign('result.html');
    });

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            clickSound.play();
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
                fullscreenBtn.classList.add('active');
            } else {
                document.exitFullscreen();
                fullscreenBtn.classList.remove('active');
            }
        });

        // Listen for fullscreen changes to hide/show button
        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement) {
                fullscreenBtn.style.display = 'none';
            } else {
                fullscreenBtn.style.display = 'flex';
            }
        });
    }

    initGame();
});
