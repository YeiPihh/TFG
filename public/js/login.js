// public/js/login.js

const loginForm = document.getElementById('login-form');

// Referencias a los inputs
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

// Escuchar el envío del formulario de inicio de sesión
loginForm.addEventListener('submit', (event) => {
  event.preventDefault(); // Evitar el envío por defecto del formulario

  const username = usernameInput.value;
  const password = passwordInput.value;

  // Realizar una solicitud POST al endpoint de inicio de sesión en el servidor
  fetch('/login', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
  })
  .then(response => response.json())
  .then(data => {
      if (data.message === 'Logged in successfully') {
          // Si el inicio de sesión fue exitoso, redirige al usuario a la página de chat
          window.location.href = '/chat';
      } else {
          // Si el inicio de sesión no fue exitoso, muestra un mensaje de error
          alert(data.message);
      }
  });
});
