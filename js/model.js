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

const colors_dict_opague = {
    "Sad": 'rgba(250,20,60, 0.2)',
    "Happy": 'rgba(0,170,0, 0.2)',
    "Surprised": 'rgba(0,0,250, 0.2)',
    "Neutral": 'rgba(150,150,150, 0.2)'
};

//Function to load model
async function loadModel() {
    let begin = Date.now();
    console.log("loading model....");
    model = await tf.loadLayersModel('saved_models/7813-bruno/model.json');
    console.log(`exec time ${Date.now() - begin}ms -- Model loaded`)
}

function annotateEmotionShapes(facesArray, emotionsArray) {
    let begin = Date.now();
    let s1 = new CanvasState(txtCanvas);
    let s2 = new CanvasState(annCanvas);
    s1.addShape(new Shape(30, 40, 0, 0, colors_dict[emotionsArray[0]], emotionsArray[0]));

    for (let i = 0; i < facesArray.length; ++i) {
        let face = facesArray[i]
        s2.addShape(new Shape(face.x,
            face.y,
            face.width,
            face.height,
            colors_dict_opague[emotionsArray[i]],
            emotionsArray[i]));
    }
}

async function getPrediction(facesArray) {
    let begin = Date.now();
    let tensorsArray = []
    let emotionsArray = []
    let predArray = []
    let pixelsArray = snapImageData(facesArray)

    pixelsArray.forEach(function (pixels) {
        tensorsArray.push(prepareTensor(pixels))
    });
    tensorsArray.forEach(function (tensor) {
        predArray.push(callModel(tensor))
    });
    predArray.forEach(function (prediction) {
        let indexMax = indexOfMax(prediction.dataSync())
        emotionsArray.push(prediction_dict[indexMax])
    });
    annotateEmotionShapes(facesArray, emotionsArray)
}

function callModel(tensor) {
    let begin = Date.now();
    return model.predict(tensor);
}

function snapImageData(facesArray) {
    let begin = Date.now();
    let pixelsArray = []
    let context = outputCanvas.getContext('2d')
    facesArray.forEach(function (face) {
        pixelsArray.push(context.getImageData(face.x, face.y, face.width, face.height))
    });
    return pixelsArray
}

function prepareTensor(pixel_array) {
    let begin = Date.now();
    let tensor = tf.browser.fromPixels(pixel_array, 1)
    tensor = tf.image.resizeBilinear(tensor.div(255), [48, 48]);
    tensor = tensor.expandDims(0);
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
    return maxIndex;
}
