document.addEventListener('DOMContentLoaded', () => {
    const loginData = JSON.parse(localStorage.getItem('loginSuccess') || '{}');

    const usernameEl = document.getElementById('username');
    const timestampEl = document.getElementById('timestamp');
    const continueButton = document.querySelector('.dashboard-button');

    if (usernameEl) {
        usernameEl.textContent = loginData.username || 'user';
    }

    if (timestampEl) {
        if (loginData.loginTime) {
            const loginDate = new Date(loginData.loginTime);
            timestampEl.textContent = loginDate.toLocaleString();
        } else {
            timestampEl.textContent = new Date().toLocaleString();
        }
    }

    if (continueButton) {
        continueButton.addEventListener('click', () => {
            window.location.href = '/';
        });
    }
});
