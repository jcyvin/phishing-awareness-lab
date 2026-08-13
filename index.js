document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');

    if (!form) {
        return;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const trainingId = document.getElementById('training_id')?.value.trim();
        const password = document.getElementById('password')?.value.trim();

        if (!trainingId || !password) {
            alert('Please enter both username and password.');
            return;
        }

        const loginAttempt = {
            training_id: trainingId,
            password,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('loginAttempt', JSON.stringify(loginAttempt));
        window.location.href = 'submit.html';
    });
});
