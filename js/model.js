let model = true

const prediction_dict = {
    0: "Sad",
    1: "Happy",
    2: "Surprised",
    3: "Neutral"
};

const colors_dict = {
    "Sad": 'rgba(250,20,60)',
    "Happy": 'rgba(0,170,0)',
    "Surprised": 'rgba(0,0,250)',
    "Neutral": 'rgba(150,150,150)'
};

//Function to load model
async function loadModel() {
  let begin = Date.now();
  console.log("loading model....");
  model = await tf.loadLayersModel('saved_models/7813-bruno/model.json');
  console.log(`exec time ${Date.now() - begin} -- loadModel`)
}

function annotateEmotionShapes(face, emotion){
  let begin = Date.now();
  coordinates = [face.x, face.y, face.width, face.height]
  cornerCoordinates = [30, 40, 0, 0]
  annotateShapes(annCanvas1, coordinates, emotion, 'rgba(40,40,250,.2)')
  annotateShapes(annCanvas2, coordinates, emotion, 'rgba(40,40,250,.2)')
  annotateShapes(txtCanvas, cornerCoordinates, emotion, colors_dict[emotion])
  console.log(`exec time ${Date.now() - begin} -- annotateEmotionShapes`)
}

async function getPrediction(face) {
  // predicts a batch of samples
  // model.predictOnBatch(tf.ones([8, 10])).print();
  let pixels = snapImageData(face)
  let tensor = prepareTensor(pixels);
  let begin = Date.now();
  let prediction = await model.predict(tensor);
  console.log(`exec time ${Date.now() - begin} -- getPrediction`)
  let indexMax = indexOfMax(prediction.dataSync())
  emotion = prediction_dict[indexMax]
  annotateEmotionShapes(face, emotion)
}

function snapImageData(face) {
  let begin = Date.now();
  let context = outputCanvas.getContext('2d')
  let pixels = context.getImageData(face.x, face.y, face.width, face.height);
  console.log(`exec time ${Date.now() - begin} -- snapImageData`)
  return pixels
}

function prepareTensor(pixel_array) {
  let begin = Date.now();
  let tensor = tf.browser.fromPixels(pixel_array, 1)
  tensor = tf.image.resizeBilinear(tensor.div(255), [48, 48]);
  tensor = tensor.expandDims(0);
  console.log(`exec time ${Date.now() - begin} -- prepareTensor`)
  return tensor
}

// Function to get the index of the maximum value of an array
function indexOfMax(arr) {
  let begin = Date.now();
    if (arr.length === 0) {
        return -1;
    }
    let max = arr[0];
    let maxIndex = 0;
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }
    console.log(`exec time ${Date.now() - begin} -- indexOfMax`)
    return maxIndex;
}
