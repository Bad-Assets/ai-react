# ai-react

React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

@vitejs/plugin-react uses Babel for Fast Refresh
@vitejs/plugin-react-swc uses SWC for Fast Refresh
How the program works(Cliffnotes version):

Use teacheableMachine to create an image recognition model that functions off of the client's webcam

Using AJAX and a number of other methods, initialize the webcam and model whenever input needs to be collected

Using React Three Fiber and React Three Drei(Both are React libraries that build off of three.js), generate 3D objects to be thrown into the main scene based on user input

This is still a prototype so the model's reference data is limited. In order to properly test this program, you'll need the 3 reference pics that I used to train the model. They're right here: ↓ https://drive.google.com/drive/folders/1_pbAX-MrBpFjBbxSwLyzAC9oUCcb9cVJ?usp=sharing

Once you have these images donwloaded on your phone, just run this program, hit 'p' on your keyboard, and then show your webcam one of the images.

In future development, the webcam tech used to collect input will most likely be different to accomodate for the project's specific use case

CREDIT:

teacheableMachine code base: https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

teacheableMachine by Google: https://teachablemachine.withgoogle.com/
