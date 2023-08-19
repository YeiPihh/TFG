const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const homeButton = document.getElementById('homeButton');

loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw response;
        }
    })
    .then(data => {
        if (data && data.message === 'Logged in successfully') {
            window.location.href = '/chat';
        } else if (data && data.error) {
            alert(data.error);
            usernameInput.style.borderColor = 'red';
            passwordInput.style.borderColor = 'red';
        }
    })
    .catch(err => {
        err.json().then(errorData => {
            console.error(errorData);
            usernameInput.style.borderColor = 'red';
            passwordInput.style.borderColor = 'red';
        });
    });
});

homeButton.addEventListener('click', () => {
    window.location.href = '/index';
});