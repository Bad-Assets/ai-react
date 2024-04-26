import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, CameraControls } from "@react-three/drei";
import Airtable from "airtable";

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
import FirePlanet from "./components/FireplanetFINAL";
import RockPlanet from "./components/RockPlanet";
import PurpleRockPlanet from "./components/Purplerockplanet";
import IcePlanet from "./components/IcePlanet";
import GasGiant from "./components/Gasgiant";



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
  const [dataArray, setDataArray] = useState([]);

  // link to models provided by Teachable Machine export panel
  // "https://teachablemachine.withgoogle.com/models/smA9m7ak-/"// 3 class model prototype(phone picture one)
  // "https://teachablemachine.withgoogle.com/models/bEFuEcfqt/"// janky 4 class model
  // "https://teachablemachine.withgoogle.com/models/I84nEtna1/"// more "stable" 4 class model
  // "https://teachablemachine.withgoogle.com/models/tNzFMd9l8/"//bottle cap type differentiation model
  // "https://teachablemachine.withgoogle.com/models/q0vr7pziv/"//color differentiation model(EDGE)
  // "https://teachablemachine.withgoogle.com/models/_yIvQ9IlM/"//density/amount recognition model(EDGE)
  // "https://teachablemachine.withgoogle.com/models/UaXuqiPKf/"//color differentiation model(latest)
  // "https://teachablemachine.withgoogle.com/models/6ZkXtp9aY/"//density/amount recognition model(latest)

  const URL1 = "https://teachablemachine.withgoogle.com/models/UaXuqiPKf/";
  const URL2 = "https://teachablemachine.withgoogle.com/models/6ZkXtp9aY/";

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

  const base = new Airtable({
    apiKey:
      "patfDwEJuZGFpqDKx.0aedbab77f6c87ce1a448c8a0a7feacf925a5d448dc2f5832a4b135d72bacf0a",
  }).base("appubl7QMpKAxnY1K");

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

  useEffect(() => {
    base("Constellations")
      .select({ view: "Grid view" })
      .eachPage((record, fetchNextPage) => {
        // console.log(record);
        setDataArray(record);
        console.log("This is the record from db: ", dataArray);
        fetchNextPage();
      });
  });
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

  /**
   * Seed generation problem(possibly)
   */

  async function predict() {
    if (predictionMade) {
      return;
    }

    let prediction1;
    let prediction2;
    let certaintyThreshold = 0.6;

    let seed1;
    let seed2;

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

    // console.log(prediction1, prediction2);

    for (let i = 0; i < maxPredictions2; i++) {
      const classPrediction2 =
        prediction2[i].className + ": " + prediction2[i].probability.toFixed(2);
      labelContainer2.childNodes[i].innerHTML = classPrediction2;

      if (
        parseFloat(prediction2[i].probability.toFixed(2)) > certaintyThreshold
      ) {
        // setConstellationSeed2(i + 1);
        seed2 = i + 1;
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
        // setConstellationSeed(i + 1); // Update the seed
        // setPredictionMade(true); // Indicate prediction made
        seed1 = i + 1;
        break; // Break the loop after the first prediction above threshold
      }
    }
    setConstellationSeed(seed1);
    setConstellationSeed2(seed2);
    setPredictionMade(true);
    setCamState(false); // Turn off the webcam
  }

  // After setting the prediction, generate the constellation
  /**
   * Seed generation problem(possibly)
   */
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
  }, [predictionMade, constellationSeed, constellationSeed2]);

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
    let constellationMap = "";

    //different possible constellation types
    switch (true) {
      case seed === 1 && seed2 === 1:
        console.log("magenta, small-sized constellation");
        break;
      case seed === 1 && seed2 === 2:
        console.log("magenta, medium-sized constellation");
        break;
      case seed === 1 && seed2 === 3:
        console.log("magenta, large-sized constellation");
        break;
      case seed === 2 && seed2 === 1:
        console.log("blue, small-sized constellation");
        break;
      case seed === 2 && seed2 === 2:
        console.log("blue, medium-sized constellation");
        break;
      case seed === 2 && seed2 === 3:
        console.log("blue, large-sized constellation");
        break;
      case seed === 3 && seed2 === 1:
        console.log("yellow, small-sized constellation");
        break;
      case seed === 3 && seed2 === 2:
        console.log("yellow, medium-sized constellation");
        break;
      case seed === 3 && seed2 === 3:
        console.log("yellow, large-sized constellation");
        break;
      case seed === 4 && seed2 === 1:
        console.log("purple, small-sized constellation");
        break;
      case seed === 4 && seed2 === 2:
        console.log("purple, medium-sized constellation");
        break;
      case seed === 4 && seed2 === 3:
        console.log("purple, large-sized constellation");
        break;
      case seed === 5 && seed2 === 1:
        console.log("white, small-sized constellation");
        break;
      case seed === 5 && seed2 === 2:
        console.log("white, medium-sized constellation");
        break;
      case seed === 5 && seed2 === 3:
        console.log("white, large-sized constellation");
        break;
      case seed === 6 && seed2 === 1:
        console.log("mixed, small-sized constellation");
        break;
      case seed === 6 && seed2 === 2:
        console.log("mixed, medium-sized constellation");
        break;
      case seed === 6 && seed2 === 3:
        console.log("mixed, large-sized constellation");
        break;
      default:
        break;
    }

    let cSpeed, cColorSeed, cLocation, cAmount;
    let cOffsetString = "";
    let cKey = generateUniqueKey();
    switch (seed) {
      case 1:
        cSpeed = Math.random() * (0.2 - 0.1) - 0.1;
        cColorSeed = 1;
        cLocation = [
          Math.floor(Math.random() * (20 - 10) - 10),
          Math.floor(Math.random() * (2 - 0) - 0),
          Math.floor(Math.random() * (30 - 10) - 10),
        ];
        cAmount = Math.floor(Math.random() * (4 - 2) + 2);
        break;
      case 2:
        cSpeed = Math.random() * (0.2 - 0.1) - 0.1;
        cColorSeed = 2;
        cLocation = [
          Math.floor(Math.random() * (20 - 10) - 10),
          Math.floor(Math.random() * (2 - 0) - 0),
          Math.floor(Math.random() * (30 - 10) - 10),
        ];
        cAmount = Math.floor(Math.random() * (6 - 4) + 4);
        break;
      case 3:
        cSpeed = Math.random() * (0.2 - 0.1) - 0.1;
        cColorSeed = 3;
        cLocation = [
          Math.floor(Math.random() * (20 - 10) - 10),
          Math.floor(Math.random() * (2 - 0) - 0),
          Math.floor(Math.random() * (30 - 10) - 10),
        ];
        cAmount = Math.floor(Math.random() * (8 - 6) + 6);
        break;
      case 4:
        cSpeed = Math.random() * (0.1 - 0.0) - 0.0;
        cColorSeed = 4;
        cLocation = [
          Math.floor(Math.random() * (30 - 10) - 10),
          Math.floor(Math.random() * (3 - 0) - 0),
          Math.floor(Math.random() * (30 - 10) - 10),
        ];
        cAmount = Math.floor(Math.random() * (4 - 2) + 2);
        break;
      case 5:
        cSpeed = Math.random() * (0.1 - 0.0) - 0.0;
        cColorSeed = 5;
        cLocation = [
          Math.floor(Math.random() * (30 - 10) - 10),
          Math.floor(Math.random() * (3 - 0) - 0),
          Math.floor(Math.random() * (30 - 10) - 10),
        ];
        cAmount = Math.floor(Math.random() * (4 - 2) + 2);
        break;
      case 6:
        cSpeed = Math.random() * (0.1 - 0.0) - 0.0;
        cColorSeed = 6;
        cLocation = [
          Math.floor(Math.random() * (30 - 10) - 10),
          Math.floor(Math.random() * (3 - 0) - 0),
          Math.floor(Math.random() * (30 - 10) - 10),
        ];
        cAmount = Math.floor(Math.random() * (4 - 2) + 2);
        break;
      default:
        // cSpeed = Math.random() * (0.1 - 0.0) - 0.0;
        // cColorSeed = Math.floor(Math.random() * (4 - 1) + 1);
        // cLocation = [
        //   Math.floor(Math.random() * (30 - 10) - 10),
        //   Math.floor(Math.random() * (3 - 0) - 0),
        //   Math.floor(Math.random() * (90 - 10) - 10),
        // ];
        // cAmount = Math.floor(Math.random() * (4 - 2) + 2);
        alert("Bro's tweaking...");
        break;
    }

    //create offset
    for (let i = 0; i < cAmount; i++) {
      cOffsetString += `${Math.random() * (8 - 3) - 3}, ${
        Math.random() * (6 - 4) - 4
      }, ${Math.random() * (4 - 3) - 3} | `;
    }

    cOffsetString += `${Math.random() * (8 - 3) - 3}, ${
      Math.random() * (6 - 4) - 4
    }, ${Math.random() * (4 - 3) - 3}`;

    // let test = cOffsetString.split(" | ");
    // console.log("cOffsetArray ", test);
    // console.log("cOffsetArray[0]", test[0].split(", "));
    // let test2 = test[0];
    // console.log(test2);

    setTransition("fadeOut");
    setTimeout(() => {
      setTransition("fadeIn");
      setGalaxy((prevGalaxy) => [
        ...prevGalaxy,
        <Constellation
          speed={cSpeed}
          key={cKey}
          colorSeed={cColorSeed}
          location={cLocation}
          creationTime={Date.now()}
          lifeSpan={lifespan}
          amount={cAmount}
          offsetString={cOffsetString}
        />,
      ]);
    }, timeOutSec);

    //add new constellation into database
    base("Constellations")
      .create({
        Speed: cSpeed,
        Key: cKey,
        x: cLocation[0],
        y: cLocation[1],
        z: cLocation[2],
        offsetArray: cOffsetString,
        Colors: cColorSeed.toString(),
        "Star Quantity": cAmount,
      })
      .then((record) => {
        console.log("Created record:", record);
      })
      .catch((err) => {
        console.error("Error creating record:", err);
      });
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
    let amountArray = [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5];

    base("Constellations")
      .create({
        Speed: 0.4,
        Key: "sally",
        x: 3,
        y: 2,
        z: 5,
        Colors: "3",
        "Star Quantity": 3,
      })
      .then((record) => {
        console.log("Created record:", record);
      })
      .catch((err) => {
        console.error("Error creating record:", err);
      });

    return (
      <>
        {/* {amountArray.map((amount, amountIndex) => (
          <> */}
            <Constellation
              speed={Math.floor(Math.random() * (0.05 - 0.02) + 0.02)}
              key={generateUniqueKey()}
              colorSeed={Math.floor(Math.random() * (4 - 1) + 1)}
              location={[1, 0, 1]}
              creationTime={Date.now()}
              lifeSpan={5000}
              amount={4}
            />
          {/* </>
        ))} */}
      </>
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

  //Finally we return jsx that contains what the end user will see 👀
  return (
    <>
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
            style={{ opacity: "0%", zIndex: -10 }}
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
            position={[0, 0, 0]} // Set camera position
            autoRotate={true}
            enablePan={true}
            autoRotateSpeed={0.1}
            enableDamping={true}
            dampingFactor={0.1}
            target={[0, 0, 0]} // Set camera target
            zoomSpeed={0.5}
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
          <FirePlanet />
          <PurpleRockPlanet />
          <GasGiant />
          <IcePlanet />
          {testFunc()}

          {dataArray &&
            dataArray.map((record) => (
              <Constellation
                speed={record.fields.Speed}
                key={record.fields.Key}
                colorSeed={parseInt(record.fields.Colors)}
                location={[record.fields.x, record.fields.y, record.fields.z]}
                creationTime={Date.now()}
                lifeSpan={300000}
                amount={record.fields["Star Quantity"]}
                offsetString={record.fields.offsetArray}
              />
            ))}
          {/* {testFunc()} */}
        </Canvas>
      </div>
    </>
  );
}

export default App;
