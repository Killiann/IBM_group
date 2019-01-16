var imageToSlices = require('image-to-slices');
function scan_image(){
//   var canvas = document.getElementById("myCanvas");
//   var ctx = canvas.getContext("2d");
//   var imageObj = new Image();
//   imageObj.src = "public/uploads/image.png";

//   imageObj.onload = function() {
//     ctx.drawImage(imageObj, 0, 0);
//   }

//   var tileWidth=300;
//   var tileHeight=300;

//   var tilesX = 10;
//   var tilesY = 10;
//   var totalTiles = tilesX * tilesY;        
//   var tileData = new Array();
//   for(var i=0; i<tilesY; i++)
//   {
//     for(var j=0; j<tilesX; j++)
//     {           
//       tileData.push(ctx.getImageData(j*tileWidth, i*tileHeight, tileWidth, tileHeight));
//     }
//   }
//   console.log("done");
//   for(var i=0;i<=totalTiles;i++){
//     var can = document.getElementById("can"+(i+1);
//     var tempImageObj = new Image();
//     tempImageObj = tileData[i];
//   }
    
    
    var lineXArray = [100, 200];
    var lineYArray = [100, 200];
    var source = 'public/uploads/image.png'; // width: 300, height: 300
    
    imageToSlices(source, lineXArray, lineYArray, {
        saveToDir: 'public/split'
    }, function() {
        console.log('the source image has been sliced into 9 sections!');
});

}

