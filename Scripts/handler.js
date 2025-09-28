document.addEventListener('DOMContentLoaded', () => {
    const quitBtn = document.getElementById('quit-btn');

    if (quitBtn) {
        quitBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to quit?')) {
                window.location.assign('/home.html');
            }
        });
    }

    // Add other event handlers here as the application grows
});
