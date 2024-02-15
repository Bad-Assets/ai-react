import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";

import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { BlurPass, Resizer, KernelSize, Resolution } from "postprocessing";

import Constellation from "./components/Constellation";

function App() {
  //
  //
  //WEBCAM AND IMAGE RECOGNITION---------------------------------------------------------
  //
  //
  const [currentVid, setCurrentVid] = useState("/vidDefault.mp4"); //video states for switching vids
  const [transition, setTransition] = useState(""); //class state to manage fade in/out transitions via css
  const [camState, setCamState] = useState(false); //webcam state to manage whether webcam is on/off
  const webcamRef = useRef(null); // Reference for webcam object
  const [galaxy, setGalaxy] = useState([]); //parent array for holding all constellations

  // link to model provided by Teachable Machine export panel
  const URL = "https://teachablemachine.withgoogle.com/models/smA9m7ak-/";

  let model, labelContainer, maxPredictions;

  let isIos = false;
  // fix when running demo in ios, video will be frozen;
  if (
    window.navigator.userAgent.indexOf("iPhone") > -1 ||
    window.navigator.userAgent.indexOf("iPad") > -1
  ) {
    isIos = true;
  }
  //
  //
  /**
   * INITIALIZATION AND WEBCAM CONFIGURATION/FUNCTIONALITY
   * Set up model and webcam
   * Loop program when webcam is active
   * Handle DOM tasks
   */
  //
  //
  // Load the image model and setup the webcam
  //
  //
  async function init() {
    const tmImage = window.tmImage; // Assuming tmImage is available globally
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    const width = 800;
    const height = 500;
    const webcamObj = new tmImage.Webcam(width, height, flip);
    await webcamObj.setup(); // request access to the webcam

    if (isIos) {
      document.getElementById("webcam-container").appendChild(webcamObj.webcam); // webcam object needs to be added in any case to make this work on iOS
      // grab video-object in any way you want and set the attributes
      const webCamVideo = document.getElementsByTagName("video")[0];
      webCamVideo.setAttribute("playsinline", true); // written with "setAttribute" bc. iOS buggs otherwise
      webCamVideo.muted = "true";
      webCamVideo.style.width = width + "px";
      webCamVideo.style.height = height + "px";
    } else {
      document.getElementById("webcam-container").appendChild(webcamObj.canvas);
    }
    // append elements to the DOM
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
      // and class labels
      labelContainer.appendChild(document.createElement("div"));
    }

    webcamObj.play();
    webcamRef.current = webcamObj; // Assign webcam object to the useRef
    window.requestAnimationFrame(loop);
  }

  // Function to let the webcam collect input every frame
  //
  //
  async function loop() {
    if (camState && webcamRef.current) {
      webcamRef.current.update(); // update the webcam frame
      await predict();
      window.requestAnimationFrame(loop);
    }
  }
  //
  //
  /**
   * PREDICTION AND USER INPUT HANDLING
   * Use model to match user inout to reference class data
   * Allow user key input to activate webcam
   * Call appropriate functions to generate constellations and maintain parent array state
   */
  //
  //

  // Define a state variable to track if a prediction has already been made
  const [predictionMade, setPredictionMade] = useState(false);

  // run the webcam image through the image model
  async function predict() {
    if (predictionMade) {
      return; // Exit early if prediction has already been made
    }

    let prediction;
    if (isIos) {
      prediction = await model.predict(webcamRef.current.webcam);
    } else {
      prediction = await model.predict(webcamRef.current.canvas);
    }
    for (let i = 0; i < maxPredictions; i++) {
      const classPrediction =
        prediction[i].className + ": " + prediction[i].probability.toFixed(2);
      labelContainer.childNodes[i].innerHTML = classPrediction;
    }

    // Check if any prediction is above 0.9
    const detected = prediction.some(
      (p) => parseFloat(p.probability.toFixed(2)) > 0.9
    );

    if (detected) {
      if (prediction[0].probability.toFixed(2) > 0.9) {
        constellationBirth(1);
        alert("1");
      }
      if (prediction[1].probability.toFixed(2) > 0.9) {
        constellationBirth(2);
        alert("2");
      }
      if (prediction[2].probability.toFixed(2) > 0.9) {
        constellationBirth(3);
        alert("3");
      }

      setPredictionMade(true); // Set prediction made to true

      setCamState(false); // Turn off the webcam upon scanning an image so that the user doesn't have to manually do it

      // Reset prediction values(this prevents an infinite loop in which the constellationBirth
      // function is repeatedly called due to an unchanging probability value of 0.9)
      prediction.forEach((p) => {
        p.probability = 0;
        console.log(p.probability);
      });
    }
  }

  // Funtion to handle screen transitions and calls to the generateConstellation function
  // Video handling would be done in here as well if/when we decide to implement animations\
  // for constelllation creation
  const constellationBirth = (seed) => {
    switch (seed) {
      case 1:
        setTransition("fadeOut");
        setTimeout(() => {
          setTransition("fadeIn");
          generateConstellation(1);
        }, 3000);
        break;
      case 2:
        setTransition("fadeOut");
        setTimeout(() => {
          setTransition("fadeIn");
          generateConstellation(2);
        }, 3000);
        break;
      case 3:
        setTransition("fadeOut");
        setTimeout(() => {
          setTransition("fadeIn");
          generateConstellation(3);
        }, 3000);
        break;
    }
  };

  //pressing the 'p' key will turn the webcam on
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "p") {
        setCamState((prevState) => !prevState);
      }
    };

    window.addEventListener("keypress", handleKeyPress);

    return () => {
      window.removeEventListener("keypress", handleKeyPress);
    };
  }, []);

  // Initialize the webcam when the camState changes
  useEffect(() => {
    if (camState) {
      init();
    } else if (webcamRef.current) {
      webcamRef.current.stop(); // Stop the webcam if it exists
    }
  }, [camState]);

  //STAR GENERATION-----------------------------------------------------------------------
  // Generate constellations based on a seed parameter.
  // For now the seed just controls the random number of stars and the location
  // coordinates a constellation will have, but this function can be tweaked
  // to affect more things about the constellation later
  function generateConstellation(seed) {
    switch (seed) {
      case 1:
        setGalaxy((prevGalaxy) => [
          ...prevGalaxy,
          <Constellation
            speed={Math.random() * (0.2 - 0.1) - 0.1}
            key={generateUniqueKey()}
            location={[
              Math.floor(Math.random() * (20 - 0) - 0),
              Math.floor(Math.random() * (2 - 0) - 0),
              Math.floor(Math.random() * (10 - 5) - 5),
            ]}
          />,
        ]);
        break;
      case 2:
        setGalaxy((prevGalaxy) => [
          ...prevGalaxy,
          <Constellation
            speed={Math.random() * (0.2 - 0.1) - 0.1}
            key={generateUniqueKey()}
            location={[
              Math.floor(Math.random() * (20 - 5) - 5),
              Math.floor(Math.random() * (2 - 0) - 0),
              Math.floor(Math.random() * (20 - 10) - 10),
            ]}
          />,
        ]);
        break;
      case 3:
        setGalaxy((prevGalaxy) => [
          ...prevGalaxy,
          <Constellation
            speed={Math.random() * (0.2 - 0.1) - 0.1}
            key={generateUniqueKey()}
            location={[
              Math.floor(Math.random() * (20 - 10) - 10),
              Math.floor(Math.random() * (3 - 0) - 0),
              Math.floor(Math.random() * (40 - 20) - 20),
            ]}
          />,
        ]);
        break;
    }
  }

  // troubleshooting purposes
  useEffect(() => {
    console.log("Updated galaxy array:", galaxy);
  }, [galaxy]);

  // Function to generate a unique key. This allows each constellation to have a unique identity
  function generateUniqueKey() {
    return Math.random().toString(36).substr(2, 9);
  }

  //Finally we return jsx that contains what the end user will see 👀
  return (
    <>
      <div className="bg-black max-w-full h-screen flex">
        <div
          id="label-container"
          className="z-[100] text-white absolute w-[10%] h-[10%] bottom-[20%] bg-transparent"
        ></div>

        <div id="webcam-container">
          <video
            id="vidContainer"
            src={currentVid}
            style={{ opacity: "0%" }}
            autoPlay
            loop
          ></video>
        </div>

        <Canvas
          className={transition}
          camera={[0, 0, 0]}
          style={{
            background: "transparent",
            position: "absolute",
            zIndex: "500",
          }}
        >
          <OrbitControls autoRotate={true} enablePan={true} />
          <EffectComposer enabled={true}>
            <Bloom
              intensity={2.0} // The bloom intensity.
              blurPass={undefined} // A blur pass.
              kernelSize={KernelSize.LARGE} // blur kernel size.
              luminanceThreshold={0.9} // luminance threshold. Raise this value to mask out darker elements in the scene.
              luminanceSmoothing={0.025} // smoothness of the luminance threshold. Range is [0, 1].
              mipmapBlur={true} // Enables or disables mipmap blur.
              resolutionX={Resolution.AUTO_SIZE} // The horizontal resolution.
              resolutionY={Resolution.AUTO_SIZE} // The vertical resolution.
            />
          </EffectComposer>
          <Stars
            radius={300}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={0.5}
          />

          {galaxy}
        </Canvas>
      </div>
    </>
  );
}

export default App;

/**
 * TO DO:
 * Add some sort of timer to the constellations to make them disappear or something. That OR add "stage hazards" that do things to the stars
 */
