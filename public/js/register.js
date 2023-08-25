// public/register.js

document.querySelector('#register-form').addEventListener('submit', (event) => {
  event.preventDefault();  // Evita que la página se recargue

  // Recoge los datos de los campos del formulario
  const username = document.querySelector('#username').value;
  const password = document.querySelector('#password').value;
  const confirmPassword = document.querySelector('#confirm-password').value;
  const homeButton = document.getElementById('homeButton');

  // Verifica que la contraseña y la confirmación de contraseña sean iguales
  if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
  }

  // Construir objeto de datos del usuario
  const userData = {
      username,
      password
  };

  // Envía una solicitud HTTP POST al servidor
  fetch('/register', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)  // Convierte el objeto de datos del usuario en una cadena JSON
  })
  .then(response => response.json())  // Convierte la respuesta en un objeto JSON
  .then(data => {
      if (data.msg === 'User registered successfully') {
        alert(data.msg);
        console.log(data.msg);
        window.location.href = '/login';
      }  
      else if (data.msg === 'User already exists') {
        alert(data.msg);
    }

  })
  .catch(error => {
      console.error('Error:', error);
  });
});


homeButton.addEventListener('click', () => {
  window.location.href = '/index';
});