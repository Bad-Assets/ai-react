import React, { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";

import {
  Bloom,
  EffectComposer,
  Pixelation,
  Glitch,
} from "@react-three/postprocessing";
import {
  BlurPass,
  Resizer,
  KernelSize,
  Resolution,
  GlitchMode,
} from "postprocessing";

import Constellation from "./components/Constellation";

function App() {
  //
  //
  //WEBCAM AND IMAGE RECOGNITION---------------------------------------------------------
  //
  //
  const [currentVid, setCurrentVid] = useState("/vid0.mp4"); //video states for switching vids
  const [transition, setTransition] = useState(""); //class state to manage fade in/out transitions via css
  const [camState, setCamState] = useState(false); //webcam state to manage whether webcam is on/off
  const webcamRef = useRef(null); // Reference for webcam object
  const [galaxy, setGalaxy] = useState([]); //parent array for holding all constellations
  const [planetState, setPlanetState] = useState(0);

  // link to models provided by Teachable Machine export panel
  // "https://teachablemachine.withgoogle.com/models/smA9m7ak-/"// 3 class model prototype(phone picture one)
  // "https://teachablemachine.withgoogle.com/models/bEFuEcfqt/"// janky 4 class model
  // "https://teachablemachine.withgoogle.com/models/I84nEtna1/"// more "stable" 4 class model
  // "https://teachablemachine.withgoogle.com/models/tNzFMd9l8/"//bottle cap type differentiation model
  // "https://teachablemachine.withgoogle.com/models/q0vr7pziv/"//color differentiation model(latest)
  // "https://teachablemachine.withgoogle.com/models/_yIvQ9IlM/"//density/amount recognition model(latest)

  const URL1 = "https://teachablemachine.withgoogle.com/models/q0vr7pziv/";
  const URL2 = "https://teachablemachine.withgoogle.com/models/_yIvQ9IlM/";

  let model1,
    model2,
    labelContainer1,
    labelContainer2,
    maxPredictions1,
    maxPredictions2;

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

    const modelURL1 = URL1 + "model.json";
    const metadataURL1 = URL1 + "metadata.json";
    const modelURL2 = URL2 + "model.json";
    const metadataURL2 = URL2 + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    model1 = await tmImage.load(modelURL1, metadataURL1);
    maxPredictions1 = model1.getTotalClasses();

    model2 = await tmImage.load(modelURL2, metadataURL2);
    maxPredictions2 = model2.getTotalClasses();

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
    labelContainer1 = document.getElementById("label-container1");
    for (let i = 0; i < maxPredictions1; i++) {
      // and class labels
      labelContainer1.appendChild(document.createElement("div"));
    }

    labelContainer2 = document.getElementById("label-container2");
    for (let i = 0; i < maxPredictions2; i++) {
      // and class labels
      labelContainer2.appendChild(document.createElement("div"));
    }

    webcamObj.play();
    webcamRef.current = webcamObj; // Assign webcam object to the useRef
    window.requestAnimationFrame(loop);
  }
  //
  //
  // //
  // //
  // /**
  //  * PREDICTION AND USER INPUT HANDLING
  //  * Use model to match user inout to reference class data
  //  * Allow user key input to activate webcam
  //  * Call appropriate functions to generate constellations and maintain parent array state
  //  */
  // //
  // //

  // Function to let the webcam collect input every frame
  // // run the webcam image through the image model
  // Define a state variable to track if a prediction has already been made
  const [predictionMade, setPredictionMade] = useState(false);

  // Function to let the webcam collect input every frame
  async function loop() {
    if (camState && webcamRef.current) {
      webcamRef.current.update(); // update the webcam frame
      await predict();
    }
  }

  // Use useEffect to start the loop
  useEffect(() => {
    let frameId;
    const animate = () => {
      loop();
      frameId = window.requestAnimationFrame(animate);
    };
    if (camState) {
      animate();
    }
    // Cleanup function to stop the loop when camState is false
    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [camState, predictionMade]);

  // PREDICT FUNCTION
  // run the webcam image through the image model
  const [constellationSeed, setConstellationSeed] = useState(0);
  const [constellationSeed2, setConstellationSeed2] = useState(0);

  async function predict() {
    if (predictionMade) {
      return;
    }

    let prediction1;
    let prediction2;
    let certaintyThreshold = 0.5;

    if (isIos) {
      prediction1 = await model1.predict(webcamRef.current.webcam);
    } else {
      prediction1 = await model1.predict(webcamRef.current.canvas);
    }

    if (isIos) {
      prediction2 = await model2.predict(webcamRef.current.webcam);
    } else {
      prediction2 = await model2.predict(webcamRef.current.canvas);
    }

    for (let i = 0; i < maxPredictions2; i++) {
      const classPrediction2 =
        prediction2[i].className + ": " + prediction2[i].probability.toFixed(2);
      labelContainer2.childNodes[i].innerHTML = classPrediction2;

      if (
        parseFloat(prediction2[i].probability.toFixed(2)) > certaintyThreshold
      ) {
        setConstellationSeed2(i + 1);
        break;
      }
    }

    for (let i = 0; i < maxPredictions1; i++) {
      const classPrediction1 =
        prediction1[i].className + ": " + prediction1[i].probability.toFixed(2);
      labelContainer1.childNodes[i].innerHTML = classPrediction1;

      if (
        parseFloat(prediction1[i].probability.toFixed(2)) >
        certaintyThreshold + 0.1
      ) {
        setConstellationSeed(i + 1); // Update the seed
        setPredictionMade(true); // Indicate prediction made
        break; // Break the loop after the first prediction above threshold
      }
    }

    setCamState(false); // Turn off the webcam
  }

  // After setting the prediction, generate the constellation
  useEffect(() => {
    if (predictionMade) {
      console.log(
        "Generating constellation: ",
        constellationSeed,
        ", ",
        constellationSeed2
      );
      generateConstellation(constellationSeed, constellationSeed2);
      // setPredictionMade(false);
    }
  }, [predictionMade]);

  //pressing the 'p' key will turn the webcam on
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "p") {
        setCamState((prevState) => !prevState);
        setPredictionMade(false);
      }
    };

    window.addEventListener("keypress", handleKeyPress);

    return () => {
      window.removeEventListener("keypress", handleKeyPress);
    };
  }, []);

  useEffect(() => {
    if (camState) {
      init();
    } else {
      if (webcamRef.current) {
        // Cleanup the webcam when camState is false
        const webcam = webcamRef.current;
        webcam.stop(); //testing
        if (webcam.stream) {
          const tracks = webcam.stream.getTracks();
          tracks.forEach((track) => {
            track.stop();
          });
        }
        webcamRef.current = null;
      }
    }
  }, [camState]);

  //STAR GENERATION-----------------------------------------------------------------------
  //
  // Generate constellations based on a seed parameter
  // For now the seed just controls the random number of stars and the location
  // coordinates a constellation will have, but this function can be tweaked
  // to affect more things about the constellation later
  //

  //
  // Function to handle screen transitions and calls to the generateConstellation function
  // Video handling would be done in here as well if/when we decide to implement animations
  // for constelllation creation
  //

  //make calls to server from this function!
  function generateConstellation(seed, seed2) {
    const timeOutSec = 3000;
    const lifespan = 120000; //each constellation has a 2 minute lifespan

    console.log("Generated: ", seed, ", ", seed2);

    //different possible constellation types
    switch ([seed, seed2]) {
      case [1, 1]:
        console.log("blue, small-sized constellation");
        // setPlanetState(1);
        break;
      case [1, 2]:
        console.log("blue, medium-sized constellation");
        // setPlanetState(1);
        break;
      case [1, 3]:
        console.log("blue, large-sized constellation");
        // setPlanetState(1);
        break;
      case [2, 1]:
        console.log("black, small-sized constellation");
        // setPlanetState(2);
        break;
      case [2, 2]:
        console.log("black, medium-sized constellation");
        // setPlanetState(2);
        break;
      case [2, 3]:
        console.log("black, large-sized constellation");
        // setPlanetState(2);
        break;
      case [3, 1]:
        console.log("green, small-sized constellation");
        // setPlanetState(3);
        break;
      case [3, 2]:
        console.log("green, medium-sized constellation");
        // setPlanetState(3);
        break;
      case [3, 3]:
        console.log("green, large-sized constellation");
        // setPlanetState(3);
        break;
      case [4, 1]:
        console.log("mixed, small-sized constellation");
        // setPlanetState(4);
        break;
      case [4, 2]:
        console.log("mixed, medium-sized constellation");
        // setPlanetState(4);
        break;
      case [4, 3]:
        console.log("mixed, large-sized constellation");
        // setPlanetState(4);
        break;
      default:
        break;
    }

    switch (seed) {
      case 1:
        setTransition("fadeOut");
        setTimeout(() => {
          setTransition("fadeIn");
          setGalaxy((prevGalaxy) => [
            ...prevGalaxy,
            <Constellation
              speed={Math.random() * (0.2 - 0.1) - 0.1}
              key={generateUniqueKey()}
              colorSeed={1}
              location={[
                Math.floor(Math.random() * (20 - 10) - 10),
                Math.floor(Math.random() * (2 - 0) - 0),
                Math.floor(Math.random() * (15 - 10) - 10),
              ]}
              creationTime={Date.now()}
              lifeSpan={lifespan}
              amount={Math.floor(Math.random() * (4 - 2) + 2)}
            />,
          ]);
        }, timeOutSec);
        //server call here
        break;
      case 2:
        setTransition("fadeOut");
        setTimeout(() => {
          setTransition("fadeIn");
          setGalaxy((prevGalaxy) => [
            ...prevGalaxy,
            <Constellation
              speed={Math.random() * (0.2 - 0.1) - 0.1}
              key={generateUniqueKey()}
              colorSeed={2}
              location={[
                Math.floor(Math.random() * (20 - 10) - 10),
                Math.floor(Math.random() * (2 - 0) - 0),
                Math.floor(Math.random() * (20 - 10) - 10),
              ]}
              creationTime={Date.now()}
              lifeSpan={lifespan}
              amount={Math.floor(Math.random() * (6 - 4) + 4)}
            />,
          ]);
        }, timeOutSec);
        break;
      case 3:
        setTransition("fadeOut");
        setTimeout(() => {
          setTransition("fadeIn");
          setGalaxy((prevGalaxy) => [
            ...prevGalaxy,
            <Constellation
              speed={Math.random() * (0.2 - 0.1) - 0.1}
              key={generateUniqueKey()}
              colorSeed={3}
              location={[
                Math.floor(Math.random() * (20 - 10) - 10),
                Math.floor(Math.random() * (3 - 0) - 0),
                Math.floor(Math.random() * (40 - 20) - 20),
              ]}
              creationTime={Date.now()}
              lifeSpan={lifespan}
              amount={Math.floor(Math.random() * (8 - 6) + 6)}
            />,
          ]);
        }, timeOutSec);
        break;
      case 4:
        setTransition("fadeOut");
        setTimeout(() => {
          setTransition("fadeIn");
          setGalaxy((prevGalaxy) => [
            ...prevGalaxy,
            <Constellation
              speed={Math.random() * (0.1 - 0.0) - 0.0}
              key={generateUniqueKey()}
              colorSeed={4}
              location={[
                Math.floor(Math.random() * (30 - 10) - 10),
                Math.floor(Math.random() * (3 - 0) - 0),
                Math.floor(Math.random() * (80 - 40) - 40),
              ]}
              creationTime={Date.now()}
              lifeSpan={lifespan}
              amount={Math.floor(Math.random() * (4 - 2) + 2)}
            />,
          ]);
        }, timeOutSec);
        break;
      default:
        break;
    }
  }

  // troubleshooting purposes
  useEffect(() => {
    console.log("Updated galaxy array: ", galaxy);
    console.log(
      "Current constellation seeds: ",
      constellationSeed,
      " ",
      constellationSeed2
    );
    console.log(predictionMade);
  }, [galaxy]);

  // Function to generate a unique key. This allows each constellation to have a unique identity
  function generateUniqueKey() {
    return Math.random().toString(36).substr(2, 9);
  }

  //function to test what constellations will look like
  function testFunc() {
    return (
      <Constellation
        speed={Math.random() * (0.2 - 0.1) - 0.1}
        key={generateUniqueKey()}
        colorSeed={2}
        location={[0, 0, 0]}
        lifeSpan={5000}
      />
    );
  }

  // useEffect to remove constellations after their lifespans
  //Make server checks to see if constellations are made already here!
  useEffect(() => {
    const interval = setInterval(() => {
      setGalaxy((prevGalaxy) =>
        prevGalaxy.filter((constellation) => {
          const lifespan = constellation.props.lifeSpan || 0;
          const creationTime = constellation.props.creationTime || 0;
          return Date.now() - creationTime <= lifespan;
        })
      );
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [galaxy]);

  function renderVideo(code) {
    let source;

    switch (code) {
      case 1:
        source = "/planet1.mp4";
      default:
        break;
    }

    return code === 0 ? (
      ""
    ) : (
      <div style={{ width: "100%", height: "100%" }} className={transition}>
        <video
          id="vidContainer2"
          src={source}
          style={{
            opacity: "100%",
            zIndex: "105",
          }}
          autoPlay
          // loop
        ></video>
      </div>
    );
  }

  //Finally we return jsx that contains what the end user will see 👀
  return (
    <>
      {/* {renderVideo(planetState)} */}
      <div className="bg-black container max-w-full h-screen flex">
        <div
          id="label-container1"
          className="z-[100] text-white/[0.5] absolute w-[10%] h-[10%] bottom-[20%] bg-transparent"
        ></div>

        <div
          id="label-container2"
          className="z-[100] text-white/[0.5] absolute w-[10%] h-[10%] bottom-[40%] bg-transparent"
        ></div>

        <div id="webcam-container" className={transition}>
          <video
            id="vidContainer"
            src={currentVid}
            style={{ opacity: "10%", zIndex: -10 }}
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
            zIndex: "100",
          }}
        >
          <OrbitControls
            autoRotate={true}
            enablePan={true}
            autoRotateSpeed={0.1}
          />
          <EffectComposer enabled={true}>
            <Bloom
              intensity={3.0} // The bloom intensity.
              blurPass={undefined} // A blur pass.
              kernelSize={KernelSize.LARGE} // blur kernel size.
              luminanceThreshold={0.9} // luminance threshold. Raise this value to mask out darker elements in the scene.
              luminanceSmoothing={0.025} // smoothness of the luminance threshold. Range is [0, 1].
              mipmapBlur={true} // Enables or disables mipmap blur.
              resolutionX={Resolution.AUTO_SIZE} // The horizontal resolution.
              resolutionY={Resolution.AUTO_SIZE} // The vertical resolution.
            />
            {/* <Pixelation granularity={3} />
            <Glitch
              delay={[1.5, 3.5]} // min and max glitch delay
              duration={[0.6, 1.0]} // min and max glitch duration
              strength={[0.3, 1.0]} // min and max glitch strength
              mode={GlitchMode.SPORADIC} // glitch mode
              active // turn on/off the effect (switches between "mode" prop and GlitchMode.DISABLED)
              ratio={0.85} // Threshold for strong glitches, 0 - no weak glitches, 1 - no strong glitches.
            /> */}
          </EffectComposer>
          <ambientLight />
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
          {/* {testFunc()} */}
        </Canvas>
      </div>
    </>
  );
}

export default App;

/**
 * TO DO:
 * implement 2 model prediction functionality
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
