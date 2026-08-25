document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');

    if (!form) {
        return;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = document.getElementById('username')?.value.trim();
        const password = document.getElementById('password')?.value.trim();

        if (!username || !password) {
            alert('Please enter both username and password.');
            return;
        }

        const loginAttempt = {
            username,
            password,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('loginAttempt', JSON.stringify(loginAttempt));
        window.location.href = 'submit.html';
    });
});