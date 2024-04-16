const http = require('http');
const { Server } = require('socket.io');
const { SerialPort } = require('serialport');

let io;

const btnPort = new SerialPort({
  path: '/dev/cu.usbserial-A603G9G3', // port the arduino is connected to
  baudRate: 9600,
});

const socketSetup = (app) => {
  const server = http.createServer(app);
  io = new Server(server);

  io.on('connection', (socket) => {
    console.log('Client connected');

    // listen for incoming serial data from the arduino
    btnPort.on('data', (data) => {
      console.log('Data: ', data.toString());
      if (data.includes('1')) {
        console.log('Button pressed!');

        // button is pressed, send a message via WebSocket
        socket.emit('buttonPressed');
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return server;
};

module.exports = socketSetup;
