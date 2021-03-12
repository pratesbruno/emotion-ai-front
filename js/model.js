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
  console.log("loading model....");
  model = await tf.loadLayersModel('saved_models/7813-bruno/model.json');
}

function annotateEmotionShapes(emotion){
  coordinates = [face.x, face.y, face.width, face.height]
  cornerCoordinates = [30, 40, 0, 0]
  annotateShapes(annCanvas1, coordinates, emotion, 'rgba(40,40,250,.2)')
  annotateShapes(annCanvas2, coordinates, emotion, 'rgba(40,40,250,.2)')
  annotateShapes(txtCanvas, cornerCoordinates, emotion, colors_dict[emotion])
}

function get_prediction(face) {
  snapImageData(face).then(function (imgData) {
    let tensor = prepare_tensor(imgData);
    console.log(tensor.shape)
    let prediction = model.predict(tensor);
    let indexMax = indexOfMax(prediction.dataSync())
    emotion = prediction_dict[indexMax]
    annotateEmotionShapes(emotion)
  });
}

function snapImageData(face) {
  return new Promise(function (resolve, reject) {
    if (face == null) return reject();
    context = outputCanvas.getContext('2d')
    resolve(context.getImageData(face.x, face.y, face.width, face.height));
  });
}

function prepare_tensor(pixel_array) {
  let a = tf.browser.fromPixels(pixel_array, 1)
  let resized = tf.image.resizeBilinear(a.div(255), [48, 48]);
  tensor = resized.expandDims(0);
  return tensor
}

// Function to get the index of the maximum value of an array
function indexOfMax(arr) {
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
    return maxIndex;
}
