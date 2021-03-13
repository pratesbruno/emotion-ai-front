const video = document.getElementById("cam_input"); // let video ...
const annCanvas1 = document.getElementById('annCanvas1')
const annCanvas2 = document.getElementById('annCanvas2')
const outputCanvas = document.getElementById('canvas_output')
const txtCanvas = document.getElementById('txtCanvas')
const faceCascadeFile = 'haarcascade_frontalface_default.xml'; // path to xml
const FPS = 24;

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
      let cropped = new cv.Mat();
      let cap = new cv.VideoCapture(cam_input);
      let faces = new cv.RectVector();
      let classifier = new cv.CascadeClassifier();
      let mSize = new cv.Size((video.height / 4), (video.width / 4));
      let utils = new Utils('errorMessage');
      utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
          classifier.load(faceCascadeFile); // in the callback, load the cascade from file
      });

      function processVideo() {
        let begin = Date.now();
        cap.read(src);
        src.copyTo(dst);
        console.log(`exec time ${Date.now() - begin} -- ## until detecting faces`)
        cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY);
        try {
            classifier.detectMultiScale(gray, faces, 1.1, 3, 0, mSize);
        } catch (err) {
            console.log(err);
        }
        console.log(`exec time ${Date.now() - begin} -- ## until draw rectangles`)
        for (let i = 0; i < faces.size(); ++i) {
            face = faces.get(i);
            let point1 = new cv.Point(face.x, face.y);
            let point2 = new cv.Point(face.x + face.width, face.y + face.height);
            cv.rectangle(dst, point1, point2, [255, 0, 0, 255]);
        }
        console.log(`exec time ${Date.now() - begin} -- ## until predict`)
        if (faces.size() > 0) {
          getPrediction(faces.get(0))
          console.log(`${faces.size()} faces detected`)
        }
        console.log(`exec time ${Date.now() - begin} -- ## until redraw`)
        cv.imshow("canvas_output", dst);
        let delay = 10000 / FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
        console.log(`exec time ${Date.now() - begin} -- ## process video`)
        console.log(`===============================`)

      }

    setTimeout(processVideo, 0);
  }
};

