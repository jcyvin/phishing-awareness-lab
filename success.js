document.addEventListener('DOMContentLoaded', () => {
    const data = JSON.parse(localStorage.getItem('loginAttempt') || '{}');
    const username = data.training_id || 'user';

    const usernameEl = document.getElementById('username');
    if (usernameEl) {
        usernameEl.textContent = username;
    }

    const timestampEl = document.getElementById('timestamp');
    if (timestampEl) {
        timestampEl.textContent = data.timestamp ? new Date(data.timestamp).toLocaleString() : 'N/A';
    }
});
