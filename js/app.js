const video = document.getElementById("cam_input"); // let video ...
const annCanvas1 = document.getElementById('annCanvas1')
const annCanvas2 = document.getElementById('annCanvas2')
const outputCanvas = document.getElementById('canvas_output')
const txtCanvas = document.getElementById('txtCanvas')
const faceCascadeFile = 'haarcascade_frontalface_default.xml'; // path to xml

const FPS = 24;
let face = false

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
      let utils = new Utils('errorMessage');
      utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
          classifier.load(faceCascadeFile); // in the callback, load the cascade from file
      });

      function processVideo() {
        let begin = Date.now();
        cap.read(src);
        src.copyTo(dst);
        cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY);
        try {
            classifier.detectMultiScale(gray, faces, 1.1, 3, 0);
        } catch (err) {
            console.log(err);
        }
        for (let i = 0; i < faces.size(); ++i) {
            face = faces.get(i);
            let point1 = new cv.Point(face.x, face.y);
            let point2 = new cv.Point(face.x + face.width, face.y + face.height);
            cv.rectangle(dst, point1, point2, [255, 0, 0, 255]);
            annotateEmotionShapes(face)
        }
        cv.imshow("canvas_output", dst);
        // take_snapshot(face)

        let delay = 10000 / FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
      }
      function take_snapshot(face) {
          if (face) {
              // let rect = new cv.Rect(face.x, face.y, face.width, face.height)
              // cropped = src.roi(rect);
              // cv.imshow("canvas_snapout", cropped);
              // let canvas2 = document.getElementById("canvas_snapout")
              // let canvas3 = document.getElementById("canvas_snapout1")

              // let context = outputCanvas.getContext('2d')

              // gray_crop = new cv.Mat();
              // cv.cvtColor(cropped, gray_crop, cv.COLOR_RGBA2GRAY);
              // // let tensor = tf.tensor(gray_crop.data)
              // tf.browser.toPixels(tensor, canvas3)
              // console.log('after creation')
              // console.log(tensor.shape)
              // console.log(tensor.dataSync())
              annotateEmotionShapes(face)
              // console.log('-------gray------')
              // console.log(gray.data)
              // console.log(Math.max(gray.data))
          }
      }

      // function take_snapshot(face) {
      //   if (face) {
      //       let cropped = src.roi(face);
      //       cv.cvtColor(cropped, cropped, cv.COLOR_RGBA2GRAY);
      //       let tensor = tf.tensor(cropped.data, [face.width, face.height])
      //       get_prediction(tensor)
      //     }
      //   }
    // schedule first one.
    setTimeout(processVideo, 0);
  }
};

