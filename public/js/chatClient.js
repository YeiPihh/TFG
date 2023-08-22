// chatClient.js
// Obtener referencia a los elementos del DOM
const chatForm = document.getElementById('chat-form');
const chatItems = document.querySelectorAll('.chat-item');
const chatMessagesContainer = document.getElementById('chat-messages');

const logoutButton = document.getElementById('logoutButton');
const homeButton = document.getElementById('homeButton');

const messageInput = document.getElementById('message-input');
const sendIcon = document.getElementById('icon-send');
const chatMessages = document.getElementById('chat-messages');

document.addEventListener("DOMContentLoaded", function() {
    //...
});


// Establecer conexión con Socket.io (asumiendo que tienes Socket.io configurado)   const socket = io();

let receiverId = null;


// Escuchar mensajes del servidor
socket.on('receiveMessage', (message) => {
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    chatMessagesContainer.appendChild(messageElement);
    
    // Auto-scroll al último mensaje
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
});

// Evento para seleccionar un chat específico
chatItems.forEach(item => {
    item.addEventListener('click', async (event) => {
        const chatId = item.dataset.id;
        const receiverId = item.dataset.receiverId;

        try {
            const response = await fetch(`/chat-history/${chatId}`);
            const text = await response.text(); // Obtén la respuesta como texto
            console.log('Respuesta como texto:', text); // Imprímela en la consola

            const data = JSON.parse(text); // Analiza la respuesta como JSON

            if (data.success && data.messages) {
                chatMessagesContainer.innerHTML = '';
                data.messages.forEach(message => {
                    const messageElement = document.createElement('p');
                    messageElement.textContent = message.content;
                    chatMessagesContainer.appendChild(messageElement);
                });
            } else {
                console.error('Error al obtener el historial del chat:', data.error);
            }
        } catch (error) {
            console.error('Error al hacer la solicitud:', error);
        }
    });
});


// Evento para seleccionar un chat específico
chatItems.forEach(item => {
    item.addEventListener('click', async (event) => {
        const chatId = item.dataset.id;
        const contactName = item.textContent; // Aquí obtienes el nombre del contacto

        // Actualizar el nombre del contacto en la cabecera del chat
        document.getElementById('contactNameText').textContent = contactName;

        try {
            const response = await fetch(`/chat-history/${chatId}`);
            const data = await response.json();

            if (data.success && data.messages) {
                chatMessagesContainer.innerHTML = '';
                data.messages.forEach(message => {
                    const messageElement = document.createElement('p');
                    messageElement.textContent = message.content;
                    chatMessagesContainer.appendChild(messageElement);
                });
            } else {
                console.error('Error al obtener el historial del chat:', data.error);
            }
        } catch (error) {
            console.error('Error al hacer la solicitud:', error);
        }
    });
});



// Escuchar eventos del socket (esto es solo un ejemplo).
socket.on('messageReceived', (data) => {
    const messageElement = document.createElement('p');
    messageElement.textContent = data.message;
    chatMessages.appendChild(messageElement);
});

sendIcon.addEventListener('click', () => {
    const message = messageInput.value;
    if (message.trim()) {  // Solo enviar si el mensaje no está vacío
        socket.emit('sendMessage', message);  // Envía el mensaje al servidor
        messageInput.value = '';  // Limpia el input después de enviar el mensaje
    }
});

logoutButton.addEventListener('click', () => {
    window.location.href = '/logout';
});

homeButton.addEventListener('click', () => {
    window.location.href = '/index';
});

document.getElementById('contactButton').addEventListener('click', () => {
    document.getElementById('addContactForm').style.display = 'block'; // Mostrar el formulario
  });

document.getElementById('addContactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const newContactUsername = document.getElementById('newContactUsername').value;
  // Emitir un evento al servidor con el nuevo contacto
  socket.emit('addContact', newContactUsername);
  // Opcionalmente, puedes ocultar el formulario nuevamente
  document.getElementById('addContactForm').style.display = 'none';
});

document.addEventListener('DOMContentLoaded', () => {
    const contactItems = document.querySelectorAll('.contact');
    const contactNameElement = document.getElementById('contactName');
  
    contactItems.forEach(item => {
      item.addEventListener('click', () => {
        const selectedContactName = item.textContent;
        contactNameElement.textContent = selectedContactName;
        
        // Aquí puedes agregar lógica adicional si necesitas hacer algo más cuando se selecciona un contacto
      });
    });
  });



chatForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Esto previene la recarga de la página

    const messageContent = messageInput.value;
    if (messageContent.trim()) { // Solo enviar si el mensaje no está vacío
        const messageData = {
            senderId: userId, // Asegúrate de tener el ID del remitente
            receiverId: receiverId, // Asegúrate de tener el ID del destinatario
            content: messageContent,
        };

        socket.emit('sendMessage', messageData);

        const messageElement = document.createElement('p');
        messageElement.textContent = messageContent;
        chatMessagesContainer.appendChild(messageElement);

        // Auto-scroll al último mensaje
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

        // Limpiar el input
        messageInput.value = '';
        messageInput.focus();
    }
});
