// chatClient.js
// Obtener referencia a los elementos del DOM para usarlos como varibles.
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

// creamos una variable vacia para modificar su valor en un evento y poder usarlo en distintos eventos
let contactId= null;

// en este evento esperamos a que toda la pagina este cargada para enviar un console.log
document.addEventListener("DOMContentLoaded", function() {
    console.log("El DOM ha sido completamente cargado");
});

// Evento para seleccionar un chat específico
chatItems.forEach(item => {

    // evento que espera al click de cualquier etiqueta que sea hijo de chatItem
    item.addEventListener('click', async (event) => {

        // modificamos la variable creada anteriormente con valor null y confirmamos su contenido
        contactId = item.dataset.id;
        console.log("Contact ID:", contactId);

        // al hacer click en cualquier hijo de chatItem se modifica la visibilidad de la etiqueta #chat-form
        document.querySelector('#chat-form').style.visibility = 'visible';

        
        // controlamos los posibles errores al obtener el historial de algun chat
        try {
            // hacemos una variable asincrona que espera al valor de `/chat-history/${contactId}`. en el archivo index.js viene el codigo donde se obtiene el chat history
            const response = await fetch(`/chat-history/${contactId}`);

            // la variable response ahora contiene informacion de la base de datos del chat history
            const text = await response.text();

            // convertimos la variable text a un json. Ahora esta variable contiene las claves succes y messages. Succes puede tener valor true o false dependiendo si se ha podido obtener el chat history correctamente o no. La clave messages contiene informacion de cada mensaje: la hora, id del remitente , id del destinatario y el contenido del mensaje
            const data = JSON.parse(text); 
            console.log(data);
            console.log(data.messages);

            // aqui comprobamos que las variables data.succes and data.messages no sean null
            if (data.success && data.messages) {

                // vaciamos la variable chatMessagesContainer
                chatMessagesContainer.innerHTML = '';

                // por cada data.messages creamos los elementos necesarios para que se muestre el mensaje en la pagina
                data.messages.forEach(message => {
                    const messageElement = document.createElement('div');
                    const messageElementText = document.createElement('p');
                    const timeElement = document.createElement('div');

                    // aqui comprobamos de quien es cada mensaje para asignarle su estilo correspondiente
                    // message.sender_id es una varible se le asigna el valor de userId de la base de datos dependiendo de quien envie ese mensaje
                    // si este mensaje es enviado por el mismo usuario que esta ejecutando la pagina, tendra asignada la clase myMessageContainer
                    if (message.sender_id == userId){ 
                        messageElement.classList.add('myMessageContainer');
                    } else { // si no ha sido enviado por el que esta ejecutando la pagina se le asignara la clase messageContainer
                        messageElement.classList.add('messageContainer');
                    }

                    // message.timestamp contiene la hora de cada mensaje, el metodo slice nos permite escoger de la variable message.timestamp los caracteres del 12 al 16
                    const timeStamp = message.timestamp.slice(11,16);

                    // aqui asignamos como se estructuran las etiquetas de los mensajes que hemos creado antes. el metodo appendChild lo usamos para que una etiqueta html sea hija se otra etiqueta
                    messageElement.appendChild(messageElementText);
                    messageElementText.textContent = message.content;
                    chatMessagesContainer.appendChild(messageElement);
                    timeElement.textContent = timeStamp;
                    timeElement.classList.add('timeMessage');
                    messageElement.appendChild(timeElement);

                    // cada chat tiene un chatHeader para mostrar la foto de perfil y el nombre del contacto. El contenido de este header esta oculto si no has seleccionado ningun chat. Si se activa el evento click de chatItem cambaira la clase del chatHeader para que se muestre la informacion del contacto seleccionado
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

// estos dos evnetos click son para controlar a donde redirigir al usuario si pulsa alguno de estos dos botones
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

// Mostrar/ocultar el formulario de agregar contacto cuando se hace clic en el botón
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

// de la etiqueta addContactform creamos un evento para enviar un request al servidor de socketio para agregar un contacto
document.getElementById('addContactForm').addEventListener('submit', (e) => {
    e.preventDefault();

    // de la etiqueta newContactUsername obtenemos el valor para guardarlo en una constante
    const newContactUsername = document.getElementById('newContactUsername').value;

    // Emitimos un evento al servidor con el nuevo contacto
    socket.emit('addContact', newContactUsername);

    // ocultar el formulario nuevamente
    document.getElementById('addContactForm').style.display = 'none';

    // recargamos la pagina si se ha añadido el contacto
    socket.on('addContactSuccess', (message) => {
        console.log(message);
        location.reload(); // Recarga la página
    });

    // creamos un alert si no se ha podido agregar al contacto, el mensaje de error es controlado por el servidor
    socket.on('addContactError', (message) => {
        console.log(message);
        alert(message);
    });
});

// en este evento esperamos a que el DOM se cargue por completo
document.addEventListener('DOMContentLoaded', () => {

    // obtenemos todos los elementos con la clase chat-item y los almacenamos en la constante contactItems
    const contactItems = document.querySelectorAll('.chat-item');

    // obtenemos y guardamos el elemento con el id: contactNameText
    const contactNameElement = document.getElementById('contactNameText');
  
    // por cada item creamos un evento click
    contactItems.forEach(item => {
        item.addEventListener('click', () => {
            // obtenemos y almacenamos los elemenentos con la clase contactName
            const contactElement = item.querySelector('.contactName');

            // si encuentra los items contactName devuelve la cadena de texto que contiene, si no, devuelve una cadena vacia y los almacena en contactNameElement.textContent
            const selectedContactName = contactElement ? contactElement.textContent : '';
            contactNameElement.textContent = selectedContactName;
        }); 
    });
});

let lastMessage = null;

// creaos un evento de submit para la variable chatForm
chatForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Esto previene la recarga de la página

    // messageInput.value es el mensaje escrito por el usuario
    const messageContent = messageInput.value;
    
    if (messageContent.trim()) { // Solo enviar si el mensaje no está vacío

        // userId y contactId son variables de la base de datos que pasan al frontend desde su endpoint correspondiente que se encuentra en index.js 
        const messageData = {
            senderId: userId,
            receiverId: contactId,
            content: messageContent, // este es el contenido del mensaje del usuario
        };
        
        // emitimos un evento al servidor socketio para enviar el mensaje
        socket.emit('sendMessage', messageData);

        // creamos etiquetas html para mostrar los mensajes que envie el usuario
        const messageElement = document.createElement('div');
        const messageElementText = document.createElement('p');

        // añadimos la clase myMessageContainer a messageElement
        messageElement.classList.add('myMessageContainer');

        // asignamos la estructura de las etiquetas que muestran los mensajes
        messageElement.appendChild(messageElementText);
        messageElementText.textContent = messageContent
        chatMessagesContainer.appendChild(messageElement);

        // Auto-scroll al último mensaje
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight

        // en la lista de contactos se mostrara el ultimo mensaje del chat history
        const lastMessageElement = document.getElementById(`lastMessage_${contactId}`);
        if (lastMessageElement) {
            lastMessageElement.textContent = messageContent;
        }

        // Limpiar el input
        messageInput.value = '';
        messageInput.focus();
    }
});

//escuchamos el evento del servidor cuando te envian un mensaje y se crean etiquetas html para que se muestre el mensaje recibido
socket.on('receiveMessage', (messageData) => {
    const messageElement = document.createElement('div');
    const messageElementText = document.createElement('p');
    messageElement.classList.add('messageContainer');
    messageElementText.textContent = messageData.content;
    chatMessagesContainer.appendChild(messageElement);
    messageElement.appendChild(messageElementText);
    
    // creamos una variable lastMessageElement que sera equivalente a la etiqueta con el id: lastMessage_${messageData.senderId}
    const lastMessageElement = document.getElementById(`lastMessage_${messageData.senderId}`);
    
    // si esta variable no es nula le inserta messageData.content
    if (lastMessageElement) {
        lastMessageElement.textContent = messageData.content; // messageData.content es el objeto que contiene la informacion del mensaje recibido, en este caso .content es el contenido del mensaje recibido
    }
    // esto nos permite que cuando recibimos un mensaje se creen los elementos necesarios para mostrar el mensaje a tiempo real

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