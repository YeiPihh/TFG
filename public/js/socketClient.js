// socketClient.js

// Crear una instancia de Socket.IO para conectar al servidor
const socket = io();

// Manejar eventos en el lado del cliente
socket.on('connect', () => {
  console.log('Conectado al servidor de Socket.IO');
});

socket.on('disconnect', () => {
  console.log('Desconectado del servidor de Socket.IO');
});