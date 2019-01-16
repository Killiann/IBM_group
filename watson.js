function classify(fileName){
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