const http = require("http");
const path = require("path");
const fs = require("fs");
const express = require("express");
const multer = require("multer");
var Jimp = require('jimp')

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3000;

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
    var tileWidth = 1000;
    var tileHeight = 1000;

    for(let x=0;x<=2;x++){ 
      for(let y=0;y<=2;y++){  
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
    