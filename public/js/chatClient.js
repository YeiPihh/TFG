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

const contactButton = document.getElementById('contactButton');
const addContactForm = document.getElementById('addContactForm');

const menuButton = document.getElementById('menuButton');
const menuChat = document.getElementById('menuChat');
const iconChatMobile = document.getElementById('iconChatMobile');
const imagenChatHeader = document.getElementById('imagenChatHeader');

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
            console.log(userId); 

            const data = JSON.parse(text); // Analiza la respuesta como JSON
            console.log(data.messages);

            if (data.success && data.messages) {
                chatMessagesContainer.innerHTML = '';
                data.messages.forEach(message => {
                    const messageElement = document.createElement('div');
                    const messageElementText = document.createElement('p');
                    const timeElement = document.createElement('div');

                    if (message.sender_id == userId){
                        messageElement.classList.add('myMessageContainer');
                    } else {
                        messageElement.classList.add('messageContainer');
                    }

                    const timeStamp = message.timestamp.slice(11,16);

                    messageElement.appendChild(messageElementText);
                    messageElementText.textContent = message.content;
                    chatMessagesContainer.appendChild(messageElement);
                    timeElement.textContent = timeStamp;
                    timeElement.classList.add('timeMessage');
                    messageElement.appendChild(timeElement);

                    //mostrar el contenido del header del chat
                    if (imagenChatHeader.classList.contains("hidden")) {
                        imagenChatHeader.classList.remove("hidden");
                        imagenChatHeader.classList.add("visible");
                    }

                    //mostrar el contenido del chat history
                    if (chatMessages.classList.contains("hidden")) {
                        chatMessages.classList.remove("hidden");
                        chatMessages.classList.add("visible");
                    }
                });

                // Auto-scroll al último mensaje
                chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight

            } else {
                console.error('Error al obtener el historial del chat:', data.error);
            }

        } catch (error) {
            console.error('Error al hacer la solicitud:', error);
        }
    });
});

logoutButton.addEventListener('click', () => {
    window.location.href = '/logout';
});

homeButton.addEventListener('click', () => {
    window.location.href = '/index';
});

//Mostrar ocultar menu
menuButton.addEventListener('click', (event) => {
    event.stopPropagation();
    if (menuChat.classList.contains("hidden")) {
        menuChat.classList.remove("hidden");
        menuChat.classList.add("visible");
    } else {
        menuChat.classList.remove("visible");
        menuChat.classList.add("hidden");
    }
});



// Mostrar/ocultar el formulario cuando se hace clic en el botón
contactButton.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevenir que el evento se propague al documento
    if (addContactForm.style.display === 'none' || addContactForm.style.display === '') {
        addContactForm.style.display = 'block';
    } else {
        addContactForm.style.display = 'none';
    }
});

// Ocultar el formulario cuando se hace clic en cualquier otro lugar
document.addEventListener('click', (event) => {
    if (addContactForm.style.display === 'block') {
        addContactForm.style.display = 'none';
    }

    if (menuChat.classList.contains("visible")) {
        menuChat.classList.remove("visible");
        menuChat.classList.add("hidden");
    }
});

// Prevenir que el formulario se oculte si se hace clic dentro de él
addContactForm.addEventListener('click', (event) => {
    event.stopPropagation();
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
        alert(message);
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
        console.log('chatclient', contactId);
        const messageData = {
            senderId: userId, // Asegúrate de tener el ID del remitente
            receiverId: contactId, // Asegúrate de tener el ID del destinatario
            content: messageContent,
        };
        
        socket.emit('sendMessage', messageData);

        const messageElement = document.createElement('div');
        const messageElementText = document.createElement('p');

        messageElement.classList.add('myMessageContainer');

        messageElement.appendChild(messageElementText);
        messageElementText.textContent = messageContent
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

//escuchar evento del servidor cuando te envian un mensaje
socket.on('receiveMessage', (messageData) => {
    const messageElement = document.createElement('div');
    const messageElementText = document.createElement('p');
    messageElement.classList.add('messageContainer');
    messageElementText.textContent = messageData.content;
    chatMessagesContainer.appendChild(messageElement);
    messageElement.appendChild(messageElementText);
    
    const lastMessageElement = document.getElementById(`lastMessage_${messageData.senderId}`);
    if (lastMessageElement) {
        lastMessageElement.textContent = messageData.content;
    }

    // Auto-scroll al último mensaje
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
});


//MOBILE DESING
// Definir la media query
const mediaQuery = window.matchMedia('(max-width: 900px)');

// Función que manejará el cambio de diseño
function handleTabletChange(e) {
  // Comprobar si la media query es verdadera
  if (e.matches) {
    // Código para diseño de móvil
    document.body.classList.add('mobile');
  } else {
    // Código para diseño de escritorio
    document.body.classList.remove('mobile');
  }
}

// Evento que se dispara cuando hay un cambio en la media query
mediaQuery.addEventListener('change', handleTabletChange);

// Llamada inicial para aplicar el diseño correcto
handleTabletChange(mediaQuery);

// Función para manejar el clic en un chat
function handleChatClick() {
    if (document.body.classList.contains('mobile')) {
        document.querySelector('.chat-main').classList.add('active');
        document.querySelector('.chat-sidebar').classList.remove('active'); // Ocultar el sidebar en modo móvil
    } else {
        document.querySelector('.chat-main').classList.remove('active');
        document.querySelector('.chat-sidebar').classList.add('active'); // Mostrar el sidebar en modo escritorio
    }
}

iconChatMobile.addEventListener('click', () => {
    if (document.body.classList.contains('mobile')) {
        document.querySelector('.chat-main').classList.remove('active');
        document.querySelector('.chat-sidebar').classList.add('active'); // Ocultar el sidebar en modo móvil
    } 
});

// Añadir el evento de clic a los elementos del chat
chatItems.forEach(item => item.addEventListener('click', handleChatClick));