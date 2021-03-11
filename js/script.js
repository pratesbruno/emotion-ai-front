// Initialize global variables
let model = true
let face = false
let video = true

let prediction_dict = {
    0: "Sad",
    1: "Happy",
    2: "Surprised",
    3: "Neutral"
};

document.getElementById("clickMe").onclick = load_model;

function openCvReady() {
    cv['onRuntimeInitialized'] = () => {
        video = document.getElementById("cam_input"); // let video ...
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then(function (stream) {
                video.srcObject = stream;
                video.play();
            })
            .catch(function (err) {
                console.log("An error occurred! " + err);
            });
        let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
        let gray = new cv.Mat();
        let cap = new cv.VideoCapture(cam_input);
        let faces = new cv.RectVector();
        let classifier = new cv.CascadeClassifier();
        let utils = new Utils('errorMessage');
        let faceCascadeFile = 'haarcascade_frontalface_default.xml'; // path to xml
        utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
            classifier.load(faceCascadeFile); // in the callback, load the cascade from file 
        });
        const FPS = 24;
        function processVideo() {
            let begin = Date.now();
            cap.read(src);
            src.copyTo(dst);
            cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);
            try {
                classifier.detectMultiScale(gray, faces, 1.1, 3, 0);
            } catch (err) {
                console.log(err);
            }
            for (let i = 0; i < faces.size(); ++i) {
                //let face = faces.get(i);
                face = faces.get(i);
                let point1 = new cv.Point(face.x, face.y);
                let point2 = new cv.Point(face.x + face.width, face.y + face.height);
                cv.rectangle(dst, point1, point2, [255, 0, 0, 255]);
            }
            cv.imshow("canvas_output", dst);

            take_snapshot(face)

            let delay = 10000 / FPS - (Date.now() - begin);
            setTimeout(processVideo, delay);
        }
        // schedule first one.
        setTimeout(processVideo, 0);
    };
}


// FUNCTIONS

//Function to load model
async function load_model() {
    console.log("button clicked");
    model = await tf.loadLayersModel('saved_models/7813-bruno/model.json');
    console.log(model)
}

// Get face image and call function to make prediction
function take_snapshot(face) {
    if (face) {
        let src2 = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        let rect2 = new cv.Rect(face.x, face.y, face.width, face.height)
        cropped = src2.roi(rect2);
        cv.imshow("canvas_snapout", cropped);
        let canvas2 = document.getElementById("canvas_snapout")
        const dataURL2 = canvas2.toDataURL();
        get_prediction(dataURL2)
    }
    else {
        console.log('no face')
    }
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
        prediction.print()
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
