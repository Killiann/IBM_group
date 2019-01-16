const http = require("http");
const path = require("path");
const fs = require("fs");
const express = require("express");
const multer = require("multer");
var Jimp = require('jimp');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3000;

var imgWidth = 3000;
var imgHeight = 3000;

var tilesX = 3;
var tilesY = 3;
var totalTiles = tilesX * tilesY;

var tileWidth = imgWidth / tilesX;
var tileHeight = imgHeight / tilesY;

httpServer.listen(3000, () => {
    console.log(`Server is listening on port ${PORT}`);
});

app.get("/", express.static(path.join(__dirname, "./public")));
app.use('/public', express.static(__dirname + "/public"));

const handleError = (err, res) => {
    res
      .status(500)
      .contentType("text/plain")
      .end("Oops! Something went wrong!");
  };
  
  const upload = multer({
    dest: "./public/uploads"
  });

  var splitImg = function(){
    // splitting image
    for(let x=0;x<tilesX;x++){ 
      for(let y=0;y<tilesY;y++){  
        Jimp.read(path.join(__dirname, "./public/uploads/image.png"))
          .then(lenna => {
            return lenna
              .clone()
              .crop(x*tileWidth, y*tileHeight, tileWidth-1, tileHeight-1)
              .write(path.join(__dirname, "./split/")+ x.toString() + y.toString() + '.jpg'); // save
          })
          .catch(err => {
            console.error(err);
          });
          console.log("run");
      }
    }
  }

  var watsonRun = function(){
    // run through watson
    for(let x=0;x<tilesX;x++){ 
      for(let y=0;y<tilesY;y++){  
        classify(path.join(__dirname, "./split/")+ x.toString() + y.toString() + '.jpg')
      }
    }
  }

  // linking to watson function, handles all API calls
  var classify = function(fileName){
    var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
    var fs = require('fs');

    var visualRecognition = new VisualRecognitionV3({
    version: '2018-03-19',
    iam_apikey: 'mf50QOufCEr9otMl3WKiXdYMu2Rti3KTMKxOFoaDYqYV'
    });

    var images_file= fs.createReadStream(fileName); //<- this is where we add the image from the webpage
    var classifier_ids = ["Buildings_87615665"]; //Add the custom model id you get from the implementation once its trained
    var threshold = 0.00; //could change the threshold here to avoid false positives perhaps

    var params = {
    images_file: images_file,
    classifier_ids: classifier_ids,
    threshold: threshold
    };

    visualRecognition.classify(params, function(err, response){
    if (err) {
    console.log(err);
    } else {
    console.log(JSON.stringify(response, null, 2))
    }
    });
}

  app.post('/wats', function(req, res) {
    console.log(req.body);
    res.send(204);
    watsonRun();
  });

  app.post('/scan', function(req, res) {
    console.log(req.body);
    res.send(204);
    splitImg();
  });
  
  app.post("/upload",
    upload.single("file"),
    (req, res) => {
      const tempPath = req.file.path;
      const targetPath = path.join(__dirname, "./public/uploads/image.png");
  
      if (path.extname(req.file.originalname).toLowerCase() === ".png" || path.extname(req.file.originalname).toLowerCase() === ".jpg" || path.extname(req.file.originalname).toLowerCase() === ".jpeg") {
        fs.rename(tempPath, targetPath, err => {
          if (err) return handleError(err, res);
          res
            .status(204)
            .contentType("text/plain")
            .end("File uploaded!");
        });
      } else {
        fs.unlink(tempPath, err => {
          if (err) return handleError(err, res);
  
          res
            .status(403)
            .contentType("text/plain")
            .end("Only .png files are allowed!");
        });
      }
    }
  );
    