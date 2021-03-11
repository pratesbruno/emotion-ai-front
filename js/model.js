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

// Function to get prediction from a dataURL format
function get_prediction(dataURL) {
    convertURIToImageData(dataURL).then(function (imageData) {
        let a = tf.browser.fromPixels(imageData, 1)
        a = a.div(255)
        let resized = tf.image.resizeBilinear(a, [48, 48]);
        let tensor = resized.expandDims(0);
        let prediction = model.predict(tensor);
        let indexMax = indexOfMax(prediction.dataSync())
        emotion = prediction_dict[indexMax]
        document.getElementById("prediction").innerText = emotion
        coordinates = [ face.x, face.y, face.width, face.height ]
        corner = [ 30, 40, 0, 0 ]
        annotateShapes(annCanvas, coordinates, emotion, 'rgba(40,40,250,.2)')
        annotateShapes(txtCanvas, corner, emotion, 'rgba(40,40,250)')
    });
}

// Function to convert URI to Imagedata
function convertURIToImageData(URI) {
    return new Promise(function (resolve, reject) {
        if (URI == null) return reject();
        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            image = new Image();
        image.addEventListener('load', function () {
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            resolve(context.getImageData(0, 0, canvas.width, canvas.height));
        }, false);
        image.src = URI;
    });
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
