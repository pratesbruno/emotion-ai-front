const video = document.getElementById("cam_input"); // let video ...
const annCanvas1 = document.getElementById('annCanvas1')
const annCanvas2 = document.getElementById('annCanvas2')
const txtCanvas = document.getElementById('txtCanvas')

function openCvReady() {
    cv['onRuntimeInitialized'] = () => {
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
                take_snapshot(face)
            }
            cv.imshow("canvas_output", dst);

            let delay = 10000 / FPS - (Date.now() - begin);
            setTimeout(processVideo, delay);
        }
        // Get face image and call function to make prediction
        function take_snapshot(face) {
            if (face) {
                let rect = new cv.Rect(face.x, face.y, face.width, face.height)
                cropped = src.roi(rect);
                cv.imshow("canvas_snapout", cropped);
                let canvas2 = document.getElementById("canvas_snapout")
                const dataURL2 = canvas2.toDataURL();
                get_prediction(dataURL2)
            }
            else {
                console.log('no face')
            }
        }
        // schedule first one.
        setTimeout(processVideo, 0);
    };
}
