const http = require("http");
const path = require("path");
const fs = require("fs");
const express = require("express");
const multer = require("multer");
var Jimp = require('jimp');
var async = require('async');
const jsdom = require("jsdom");
const Canvas = require('canvas')
const { JSDOM } = jsdom;


const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3000;

var imgWidth = 3000;
var imgHeight = 3000;

var tilesX = 15;
var tilesY = 15;
var totalTiles = tilesX * tilesY;

var tileWidth = imgWidth / tilesX;
var tileHeight = imgHeight / tilesY;

var watsonResp = { table: [] };
var imageDataArray = [];

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

  var runTasks = function(){
    const tasks = [
      splitImg(),
      watsonRun(addToFile(extractJSON)),
      addToFile(),
      extractJSON()
    ]
    async.waterfall(tasks, (err, res) => {
      if(err)
        return next(err);
    });
  }

  //extracts and sorts the JSON values
  function extractJSON(){
    var fs = require('fs');
    var obj = JSON.parse(fs.readFileSync('watsonData.json', 'utf8'));
    for(let i=0;i<totalTiles-1;i++){ 
      let tb = obj.table[i];
      console.log(i);
      let coord = tb.images[0]["image"].split('.')[0];
      console.log(tb.images[0]["image"].split('.')[0]);
      let val = tb.images[0].classifiers[0].classes[0]["score"];
      imageDataArray.push([coord,val]);
    }
    imageDataArray.sort(sortFunction);
    var tempArray = imageDataArray;
    imageDataArray = [];
    for(let i=0;i<totalTiles-1;i++){ 
      let coord = tempArray[i][0];
      let coordX = coord.split('-')[0];
      let coordY = coord.split('-')[1];
      imageDataArray.push([parseInt(coordX),parseInt(coordY),tempArray[i][1]]);
    }
    console.log(imageDataArray);
  }
  Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
  }
  function sortFunction(a, b) {
    if (a[0] === b[0])
        return 0;
    else
        return (a[0] < b[0]) ? -1 : 1;
  }

  var splitImg = function(){
    // splitting image
    for(let x=0;x<tilesX;x++){ 
      for(let y=0;y<tilesY;y++){  
        Jimp.read(path.join(__dirname, "./public/uploads/image.png"))
          .then(lenna => {
            return lenna
              .crop(x*tileWidth, y*tileHeight, tileWidth-1, tileHeight-1)
              .write(path.join(__dirname, "./split/")+ x.pad(2).toString() +"-"+ y.pad(2).toString() + '.jpg'); // save
          })
          .catch(err => {
            console.error(err);
          });
          console.log("run");
      }
    }
  }

  function watsonRun(){
    // run through watson
    for(let x=0;x<tilesX;x++){ 
      for(let y=0;y<tilesY;y++){  
        classify(path.join(__dirname, "./split/")+ x.pad(2).toString() + "-" + y.pad(2).toString() + '.jpg')
      }
    }
    // callback();
  }

  // linking to watson function, handles all API calls
  var classify = function(fileName){
    var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
    var fs = require('fs');

    var visualRecognition = new VisualRecognitionV3({
    version: '2018-03-19',
    iam_apikey: 'M5wRyXsWOCWJ6kWihpEtzfXgnxMGmppEU7fA0fKLoNfj'
    });

    var images_file= fs.createReadStream(fileName); //<- this is where we add the image from the webpage
    var classifier_ids = ["DefaultCustomModel_668964923"]; //Add the custom model id you get from the implementation once its trained
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
      watsonResp.table.push(response);
      console.log(response);
    }
    });
  }

  function addToFile(){
    var fs = require('fs');
    fs.writeFile('watsonData.json', (JSON.stringify(watsonResp)), 'utf8', function(err) {
      if (err) throw err;
      console.log('complete');
    });
    // callback();
  }

  function changeAddress(){
    app.use('/public/complete', express.static(__dirname + "/public/complete"));
  }

  app.post('/changePage', function(req,res){
    res.send(204);
    changeAddress();
  });

  app.post('/overlay', function(req,res){
    res.send(204);
    overLayImage();
  });

  app.post('/extract', function(req, res) {
    res.send(204);
    extractJSON();
  });

  app.post('/addtoFile', function(req, res) {
    res.send(204);
    addToFile();
  });

  app.post('/wats', function(req, res) {
    res.send(204);
    watsonRun();
  });

  app.post('/scan', function(req, res) {
    res.send(204);
    splitImg();
  });

  app.post('/runAll', function(req, res) {
    res.send(204);
    runTasks();
  })

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
    

function overLayImage(){
  const canv = Canvas.createCanvas(imgWidth,imgHeight)
  const ctx = canv.getContext('2d')

  // draw image first
  var imageObj = new Canvas.Image();

  imageObj.onload = function() {
      ctx.drawImage(imageObj, 0, 0, 3000,3000,
          0, 0, 3000, 3000);
      for(let x=0;x<tilesX;x++){
        for(let y=0;y<tilesY;y++){
          
          let arrayIndex = (x*tilesX)+y;
          var watsonVal;
          if(arrayIndex < (totalTiles-1)){
            watsonVal = imageDataArray[arrayIndex][2];
          } 

          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          ctx.rect(x*tileWidth, y*tileHeight, tileWidth, tileHeight)
          if(watsonVal < 0.4)ctx.fillStyle = "#FF1600";
          else if(watsonVal < 0.6)ctx.fillStyle = "#E85F00";
          else if(watsonVal < 0.8)ctx.fillStyle = "#FFAF00";
          else if(watsonVal < 0.9)ctx.fillStyle = "#E8DD00";
          else if(watsonVal < 1)ctx.fillStyle = "#5CFF00";
          ctx.fill();
        }
      }
  };
  imageObj.src = 'public/uploads/image.png';

  const fs = require('fs')
  const out = fs.createWriteStream(__dirname + '/final.png')
  const stream = canv.createPNGStream()
  stream.pipe(out)
  out.on('finish', () =>  console.log('The PNG file was created.'))
}