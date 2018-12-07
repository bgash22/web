var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var Gallery = require('express-photo-gallery');

var options = {
  title: 'My Awesome Photo Gallery'
};

// var out = Gallery('c:/Web/public/photos');
// console.log(out);
// app.use('/photos', function(req,res){
//   res.render(Gallery('c:/Web/public/photos', options));
// });

app.use(bodyParser);

app.use('/photos', Gallery('c:/Web/public/photos', options));
console.log(req.body);
//   // var out = res.render(Gallery('c:/Web/public/photos'));
//   console.log(app.use('/photos', Gallery('c:/Web/public/photos', options)));
// });
// function test(req, res){

// }
// test();
app.listen(3000);
