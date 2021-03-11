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

function get_prediction(dataURL) {
    convertURIToImageData(dataURL).then(function (imageData) {
        let a = tf.browser.fromPixels(imageData, 1)
        a = a.div(255)
        let resized = tf.image.resizeBilinear(a, [48, 48]);
        let tensor = resized.expandDims(0);
        console.log(model)
        let prediction = model.predict(tensor);
        let indexMax = indexOfMax(prediction.dataSync())
        emotion = prediction_dict[indexMax]
        document.getElementById("prediction").innerText = emotion
        prediction.print()
    });
}

