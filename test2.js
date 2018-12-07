var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
//var date = new Date();
var ran = Math.floor(Math.random() * 10000000001);
console.log(ran);
//console.log(date);
//var current_hour = date.getHours();
//console.log(current_hour);
var dir = __dirname + '/public/photos/' + ran + '/' ;
console.log(dir);

http.createServer(function (req, res) {
  if (req.url == '/fileupload') {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldpath = files.filetoupload.path;
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
        var newpath = dir + files.filetoupload.name;
        }
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        res.write('File uploaded and moved!');
        res.end();
      });
 });
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
  }
}).listen(8080);
