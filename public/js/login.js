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
        console.log('Received data:', data);
        if (data && data.message === 'Logged in successfully') {
            window.location.href = '/chat';
        }
    })
    .catch(err => {
        if (err.status === 401) {
            err.json().then(errorData => {
                if (errorData.error === 'Usuario o contraseña incorrecta') {
                    alert(errorData.error);
                    usernameInput.style.borderColor = 'red';
                    passwordInput.style.borderColor = 'red';
                } else {
                    console.error(errorData);
                }
            });
        } else {
            console.error('Unhandled error:', err);
        }
    });
});

homeButton.addEventListener('click', () => {
    window.location.href = '/index';
});