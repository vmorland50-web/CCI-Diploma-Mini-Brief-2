let faceapi;
let emotion = "Neutral";
let detections = [];
let bridge;
let video;
let canvas;
let currentData = "";
let saveSeconds = 1; // How often to save
let savedData = []; // Empty list to store all our saved data
let myFont;

function preload() {
  // Load a custom font before the sketch starts
  myFont = loadFont("fonts/ScienceGothic-VariableFont_CTRS,slnt,wdth,wght.ttf");
}

function setup() {
  canvas = createCanvas(640, 480);
  canvas.id("canvas");

    bridge = new SerialBridge(); // Start connection to SerialBridge
    bridge.onData('arduino_1', function(data) { // When data comes from device_1
        currentData = data.trim(); // Put it in our box and remove extra spaces
        console.log("Got data:", data); // Show in console too
    });

let timeSlider = createSlider(1, 10, 1);
  timeSlider.position(17, 190);
  timeSlider.input(() => saveSeconds = timeSlider.value());

  saveB = createButton("Start Saving").mousePressed(startSaving);
  saveB.position(17, 255);
  downL = createButton("Download JSON").mousePressed(downloadData); // Button to download data
  downL.position(17, 285);




function startSaving() {
    let milliseconds = saveSeconds * 1000; // Convert seconds to milliseconds
    setInterval(saveCurrentData, milliseconds); // Run saveCurrentData every X milliseconds
    console.log("Started saving every " + saveSeconds + " seconds"); // Tell us it started
}


function saveCurrentData() {
    if (currentData) { // Only save if we have data
        let dataEntry = { // Create a JSON object with our data
            timestamp: new Date().toISOString(), // Current time
            facedetected: detections.length,
            distance: currentData, // The Arduino data
            feeling: emotion,
            reading: savedData.length + 1 // Reading number
        };
        
        savedData.push(dataEntry); // Add this data to our list
        console.log("Saved:", dataEntry); // Show what we saved
    }
}

function downloadData() {
    if (savedData.length > 0) { // Only download if we have data
        saveJSON(savedData, 'sensor-data.json'); // Save as JSON file
        console.log("Downloaded " + savedData.length + " readings!"); // Tell us it worked
    }
}

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.id("video");

  const options = {
    withLandmarks: true,
    withExpressions: false, 
    withDescriptors: false,
    MODE: "tiny_face_detector",
    tinyFaceDetectorOptions: {
      inputSize: 416,
      scoreThreshold: 0.5
    }
  };

  faceapi = ml5.faceApi(video, options, modelReady);

}


function modelReady() {
  console.log("FaceAPI loaded.");

  video.hide();
  faceapi.detect(gotResults);
}

function gotResults(err, result) {
  if (err) {
    console.error(err);
    return;
  }

  detections = result;

  faceapi.detect(gotResults);
}



function drawBox() {
  const box = detections[0].alignedRect._box;

  noFill();
  stroke(255);
  strokeWeight(2);
  rect(box._x, box._y, box._width, box._height);
}

function drawLandmarks() {
  const pts = detections[0].landmarks.positions;

  stroke(225);
  strokeWeight(3);
  pts.forEach(pt => point(pt._x, pt._y));
}

// ------face-tracking------ 

function drawEmojiFromLandmarks() {
  const pts = detections[0].landmarks.positions;

  //Mouth
  const leftMouth = pts[48];
  const rightMouth = pts[54];
  const topLip = pts[51];
  const bottomLip = pts[57];

  //Eyebrow + eye 
  const leftBrow = pts[22];
  const rightBrow = pts[21];
  const leftEye = pts[41];
  const rightEye = pts[40];

  //Features
  let smileWidth = dist(leftMouth._x, leftMouth._y, rightMouth._x, rightMouth._y);
  let mouthOpen = dist(topLip._x, topLip._y, bottomLip._x, bottomLip._y);
  let browHeight =
    ((leftBrow._y + rightBrow._y) / 2) -
    ((leftEye._y + rightEye._y) / 2);


  //Happy
  if (smileWidth > 65) {
    emotion = "Happy";
  }

  //Surprised
  else if (mouthOpen > 25) {
    emotion = "Surprised";
  }

  //Sad
  else if (smileWidth < 45) {
    emotion = "Sad";
  }

  //Angry
  else if (browHeight < -12) {
    emotion = "Angry";
  }


}



function draw(){


  image(video, 0, 0, width, height);

  noStroke();
  fill(0, 80);
  rect(0, 0, 680, 54);
  
  noStroke();
  fill(0, 80);
  rect(0, 54, 260, 100);
  
  noStroke();
  fill(0, 80);
  rect(0, 154, 260, 190);

  if (detections.length > 0) {
    drawBox();
    drawLandmarks();
    drawEmojiFromLandmarks();

  }

  if (detections.length > 0) {
    fill(255);
  stroke(0);
  textSize(20);
  text("Yes", 190, 80);
    }
  else if (detections.length == 0){
    fill(255);
  stroke(0);
  textSize(20);
  text("No", 190, 80);
  }


  fill(255);
  stroke(0);
  textSize(20);
  text(`${emotion}`, 120, 140);
  
  fill(255);
  textSize(37.25);
  text("MEASURING INTERACTION", 10, 40);
  
    textSize(20)
  text("Face Detected: ", 10, 80);
  
    textSize(20)
    text("Distance: " + currentData + "cm", 10, 110);
  
  textSize(20)
  text("Emotion: ", 10, 140);

  textSize(20);
    text("Save Interval: " + saveSeconds + " Sec", 10, 170); // Show save time
  
    text("Readings saved: " + savedData.length, 10, 230);
  textFont(myFont);// Show how many we savedx

    if (detections.length > 0) {
    drawBox();
    drawLandmarks();
  }


}

