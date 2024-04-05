const SerialPort = require('serialport');

// create the port
const port = new SerialPort({
    path: '/dev.tty.usbserial-A603G9G3',
    baudRate: 9600,
})

port.on("data", (data) => {
    console.log("Data:", data);

    if (data.includes("Button pressed")) {
        // call the function to submit the constellation when the button is pressed
        console.log("Button pressed!");
        // setCamState((prevState) => !prevState);
        // setPredictionMade(false);
    }
});
