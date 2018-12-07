const https = require("https");
//var mongoose = require('mongoose');
var fs = require('fs');

  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb://localhost:27017/";
  var firstURL;
  var secondURL;
  var myobj;
  var dbo;

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    dbo = db.db("passport");
    dbo.collection("places").find({}).toArray(function(err, result) {
      if (err) throw err;
      var myarry = [];
      var origin = [];
      var urls = [];
      for (var i = 0; i < 183; i++) {
          myarry [i]= result[i].latitude + ',' + result[i].longitude;//result[i]  result.latitude
          origin [i]= result[i].name ;
      }
      var first = myarry.slice(0,91).join('|');
      var second = myarry.slice(91,183).join('|');
      //console.log(first);//.join('|')
      //console.log(second);//.join('|')

      for (var l = 0; l < 183; l++) {
      //for (var j = 0; j < 99; j++) {
      firstURL ='https://maps.googleapis.com/maps/api/distancematrix/json?units=METRIC&origins='
      +myarry[l]+'&destinations='+first+'&key=AIzaSyDAJvlaoEFtFqCCnJRD3Amv0UmP6AoHcSk';//AIzaSyDAJvlaoEFtFqCCnJRD3Amv0UmP6AoHcSk
      urls.push(firstURL);
      //for (var m = 99; m < 183; m++) {
      secondURL ='https://maps.googleapis.com/maps/api/distancematrix/json?units=METRIC&origins='
      +myarry[l]+'&destinations='+second+'&key=AIzaSyDAJvlaoEFtFqCCnJRD3Amv0UmP6AoHcSk';//AIzaSyDcuzlbpTia6yrERzEwWOsWtSak2M9JB4A
      urls.push(secondURL);
    //}
    //}
  }

      console.log(urls);//.join('|')
      //console.log(secondURL);//.join('|')
      //origin [l]= result[l].name ;
      //.join('|')
      //console.log(google);//.join('|')
      for (var j = 0; j < 364; j++) {
      https.get(urls[j], res => {
        res.setEncoding("utf8");
        let body = "";
        res.on("data", data => {
          body += data;
        });
        res.on("end", () => {
          body = JSON.parse(body);
          for (var k = 0; k < 91; k++) {
            myobj = { origin:body.origin_addresses[0],
              destination:body.destination_addresses[k],//result[k].name //body.destination_addresses[k]
              distance:body.rows[0].elements[k].distance.value,
              duration:body.rows[0].elements[k].duration.value
            };
            //console.log(myobj);
            dbo.collection("distances").insertOne(myobj, function(err, res) {
              //console.log(myobj);
              if (err) throw err;
              console.log("1 document inserted");
              //db.close();
            });

        }
        });
      });
      }
//console.log(origin[l]);
//}
    });
  });
