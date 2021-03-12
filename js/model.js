let model = true
const prediction_dict = {
    0: "Sad",
    1: "Happy",
    2: "Surprised",
    3: "Neutral"
};
//Function to load model
async function loadModel() {
    console.log("loading model....");
    model = await tf.loadLayersModel('saved_models/7813-bruno/model.json');
    console.log(model.summary());
  }

function get_prediction(tensor) {
  tensor = preprocess_tensor(tensor)
  let prediction = model.predict(tensor);
  let indexMax = indexOfMax(prediction.dataSync())
  emotion = prediction_dict[indexMax]
  coordinates = [ face.x, face.y, face.width, face.height ]
  cornerCoordinates = [ 30, 40, 0, 0 ]
  annotateShapes(annCanvas1, coordinates, emotion, 'rgba(40,40,250,.2)')
  annotateShapes(annCanvas2, coordinates, emotion, 'rgba(40,40,250,.2)')
  annotateShapes(txtCanvas, cornerCoordinates, emotion, 'rgba(40,40,250)')
}

function preprocess_tensor(tsr){
  tsr = tsr.div(255)
  tsr = tf.expandDims(tsr, axis=0);
  tsr = tf.expandDims(tsr, axis=-1);
  tsr = tf.image.resizeBilinear(tsr, [48, 48]);
  return tsr
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
