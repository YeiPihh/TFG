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

let contactId= null;

document.addEventListener("DOMContentLoaded", function() {
    //...
});


// Establecer conexión con Socket.io (asumiendo que tienes Socket.io configurado)   const socket = io();




// Evento para seleccionar un chat específico
chatItems.forEach(item => {
    item.addEventListener('click', async (event) => {
        contactId = item.dataset.id;
        console.log("Contact ID:", contactId);
        document.querySelector('#chat-form').style.visibility = 'visible';
        

        try {
            const response = await fetch(`/chat-history/${contactId}`);
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



// Escuchar eventos del socket (esto es solo un ejemplo).
socket.on('messageReceived', (data) => {
    const messageElement = document.createElement('p');
    messageElement.textContent = data.message;
    chatMessages.appendChild(messageElement);
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
    // ocultar el formulario nuevamente
    document.getElementById('addContactForm').style.display = 'none';

    socket.on('addContactSuccess', (message) => {
        console.log(message);
        location.reload(); // Recarga la página
    });

    socket.on('addContactError', (message) => {
        console.log(message);
        alert('Error al añadir el contacto');
    });

});

document.addEventListener('DOMContentLoaded', () => {
    const contactItems = document.querySelectorAll('.chat-item');
    const contactNameElement = document.getElementById('contactNameText');
  
    contactItems.forEach(item => {
        item.addEventListener('click', () => {
          /*const selectedContactName = item.textContent;
          contactNameElement.textContent = selectedContactName;*/

          const contactElement = item.querySelector('.contactName');
          const selectedContactName = contactElement ? contactElement.textContent : '';
          contactNameElement.textContent = selectedContactName;
        });
    });
});


let lastMessage = null;
chatForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Esto previene la recarga de la página

    const messageContent = messageInput.value;
    if (messageContent.trim()) { // Solo enviar si el mensaje no está vacío
        console.log('chatclient', contactId)
        const messageData = {
            senderId: userId, // Asegúrate de tener el ID del remitente
            receiverId: contactId, // Asegúrate de tener el ID del destinatario
            content: messageContent,
        };
        
        socket.emit('sendMessage', messageData);

        const messageElement = document.createElement('p');

        
        messageElement.textContent = messageContent
        chatMessagesContainer.appendChild(messageElement);

        // Auto-scroll al último mensaje
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight

        // Actualizar el último mensaje en la lista de contactos
        const lastMessageElement = document.getElementById(`lastMessage_${contactId}`);
        if (lastMessageElement) {
            lastMessageElement.textContent = messageContent;
        }

        // Limpiar el input
        messageInput.value = '';
        messageInput.focus();
    }
});



socket.on('receiveMessage', (messageData) => {
    const messageElement = document.createElement('p');
    messageElement.textContent = messageData.content;
    chatMessagesContainer.appendChild(messageElement);
    
    const lastMessageElement = document.getElementById(`lastMessage_${messageData.senderId}`);
    if (lastMessageElement) {
        lastMessageElement.textContent = messageData.content;
    }

    // Auto-scroll al último mensaje
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
});

