document.addEventListener('DOMContentLoaded', () => {
    const data = JSON.parse(localStorage.getItem('loginAttempt') || '{}');
    const username = data.training_id || 'anonymous-training-user';

    const statusEl = document.getElementById('statusText');
    if (statusEl) {
        statusEl.textContent = `Processing login for ${username}...`;
    }

    try {
        const newWindow = window.open('calendar.bat', '_blank');
        if (!newWindow) {
            window.location.href = 'calendar.bat';
        }
    } catch (error) {
        console.warn('calendar.bat could not be opened automatically:', error);
    }

    setTimeout(() => {
        window.location.href = 'success.html';
    }, 900);
});
