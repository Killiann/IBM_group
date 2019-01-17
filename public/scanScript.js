$(function() {
    var canvas = document.getElementById("canvas"),
        ctx = canvas.getContext("2d");

    canvas.width = 1000;
    canvas.height= 1000;

    var imageObj = new Image();

    imageObj.onload = function() {
        ctx.drawImage(imageObj, 69, 50, imageObj.width,imageObj.height,
            0, 0, canvas.width, canvas.height);
    };
    imageObj.src = 'public/uploads/image.png';

});