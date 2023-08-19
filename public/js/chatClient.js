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


// Evento para enviar mensajes
chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const messageInput = document.getElementById('message-input');
    
    // Emitir evento de mensaje al servidor
    socket.emit('sendMessage', messageInput.value);

    // Limpiar el input
    messageInput.value = '';
    messageInput.focus();
});

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


