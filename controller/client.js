var config = require('../config/config');
var placeModel = require('../model/place');
var orderModel = require('../model/order');
var orderbModel = require('../model/orderb');
var PidModel = require('../model/pid');
var express = require('express');
var app = express();
var Gallery = require('express-photo-gallery');


exports.index = function(req, res){
    placeModel.find().exec(function(err, data){
        // var placeData = "[";
        var placeData = [];
        for(var i = 0; i < data.length; i++){
            placeData.push({
                name: data[i].name,
                latitude: data[i].latitude,
                longitude: data[i].longitude,
                capacity: data[i].capacity,
                queue: data[i].queue,
                price: data[i].price,
                places: data[i].places
            })
            // if(i != 0) placeData += ',';
            // var dire = data[i].dir;
            // //console.log(dire);
            // // , "gallery":"'+Gallery(dire)+'"
            // placeData += '{"name":"'+data[i].name+'", "latitude":"'+data[i].latitude+'", "longitude":"'
            //     +data[i].longitude+'", "capacity":"'+data[i].capacity+'", "queue":"'+data[i].queue+'", "price":"'
            //     +data[i].price+'", "places":"'+data[i].places+'" }';
        }
        // placeData += "]";
        console.log(placeData);
        res.render('index', {mapkey:config.mapKey, geoKey:config.geoKey, placeData:JSON.stringify(placeData).replace(/\\/g, '\\\\').replace(/"/g, '\\\"')});
    })
}

//Orders B
exports.myorder = function(req, res){
    var userEmail = req.user.local.email;
    orderbModel.find({userEmail:userEmail}),PidModel.find({userEmail:userEmail}).exec(function(err, data){
        res.render('myorder', {orderbs:data,bids:data})
    })
}

//Get current time.
function getDateTime(){
    var d = new Date(),
    minutes = d.getMinutes().toString().length == 1 ? '0'+d.getMinutes() : d.getMinutes(),
    hours = d.getHours().toString().length == 1 ? '0'+d.getHours() : d.getHours(),
    ampm = d.getHours() >= 12 ? 'pm' : 'am',
    months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    return days[d.getDay()]+' '+months[d.getMonth()]+' '+d.getDate()+' '+d.getFullYear()+' '+hours+':'+minutes+ampm;
}


//Find order is already made.
exports.book = function(req, res){
    var placeName = req.body.placeName;
    orderModel.find({placeName:placeName, userEmail:req.user.local.email}).exec(function(err, data){
        if(data.length != 0){
            res.json({ret:false, number:data[0].number});
        }
        else {
            res.json({ret:true});
        }
    })
}
//Make order
exports.qbook = function(req, res){
    var placeName = req.body.placeName;
    var gender = req.body.gender;
    var age = req.body.age;
    var sick = req.body.sick;
    var number = req.body.bookNum;
    console.log(number);

    orderModel.find({placeName:placeName, userEmail:req.user.local.email}).exec(function(err, data){
        if(data.length != 0){
            res.json({ret:false});
        }
        else {
            var newOrder = new orderModel();
            newOrder.placeName = placeName;
            newOrder.userEmail = req.user.local.email;
            newOrder.gender = gender;
            newOrder.age = age;
            newOrder.sick = sick;
            newOrder.number = number;
            newOrder.orderTime = getDateTime();
            newOrder.status = "book";
            newOrder.save(function(err){
                if(err)
                    res.json({ret:false, err:true});
                else{
                    placeModel.find({name:placeName}).exec(function(err, data){
                        var queue = parseInt(data[0].queue) + 1;
                        placeModel.update({name:placeName}, {$set:{queue:queue.toString()}}, function(err, data){
                            if(err)
                                res.json({ret:false, err:true});
                            res.json({ret:true});
                        })
                    })
                }
            });
        }
    })
}


//Make order B
exports.bbook = function(req, res){
    //var placeName = req.body.placeName;
    var gender = req.body.gender;
    var age = req.body.age;
    var sick = req.body.sick;
    var ulat= req.body.ulat;
    var ulog= req.body.ulog;

    //var number = req.body.bookNum;
    console.log(sick);

    orderbModel.find({/*placeName:placeName,*/ userEmail:req.user.local.email}).exec(function(err, data){
        if(data.length != 0){
            res.json({ret:false});
        }
        else {
            console.log(age);
            var newOrderb = new orderbModel();
            //newOrder.placeName = placeName;
            newOrderb.userEmail = req.user.local.email;
            newOrderb.gender = gender;
            newOrderb.age = age;
            newOrderb.sick = sick;
            //newOrder.number = number;
            newOrderb.orderTime = getDateTime();
            newOrderb.status = "True";
            newOrderb.save(function(err){
                if(err)
                    res.json({ret:false, err:true});
                else{
                    /*placeModel.find({name:placeName}).exec(function(err, data){
                        var queue = parseInt(data[0].queue) + 1;
                        placeModel.update({name:placeName}, {$set:{queue:queue.toString()}}, function(err, data){
                            if(err)
                                res.json({ret:false, err:true});
                            res.json({ret:true});
                        })
                    })*/
                    res.json({ret:true});
                }
            });
        }
    })
}
