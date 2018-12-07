var UserModel = require('../model/user');
var PlaceModel = require('../model/place');
var OrderModel = require('../model/order');
var OrderbModel = require('../model/orderb');
var BidModel = require('../model/pid');
var bcrypt   = require('bcrypt-nodejs');

//Orders
exports.orders = function(req, res){
    var ownerEmail = req.user.local.email;
    OrderModel.find({placeName:ownerEmail.substring(0, ownerEmail.indexOf("@")),status:"confirm"}).exec(function(err, data){
        res.render('owner/order.ejs', {orders:data})
    })
}


//Orders B
exports.orderbs = function(req, res){
    OrderbModel.find().exec(function(err, data){
        res.render('owner/orderb.ejs', {orderbs:data})
    })
}

//Order Status Change
exports.orderStatus = function(req, res){
    //console.log("Here");
    var ownerEmail = req.user.local.email;
    //var placeName = req.body.placeName;
    var userEmail = req.body.email;
    var outTime = getDateTime();
    OrderModel.update({placeName:ownerEmail.substring(0, ownerEmail.indexOf("@")), userEmail:userEmail}, {$set:{status:"checkin"/*, outTime:outTime*/}}, function(err, data){
        console.log(ownerEmail,userEmail);
        //console.log(JSON.stringify(data, null, 4));
        if(err)
            res.json({ret:false});
        else{
            PlaceModel.find({name:ownerEmail.substring(0, ownerEmail.indexOf("@"))}).exec(function(err, data){
                console.log(JSON.stringify(data, null, 4));
                var queue = parseInt(data[0].queue) -1;
                PlaceModel.update({name:ownerEmail.substring(0, ownerEmail.indexOf("@"))}, {$set:{queue:queue.toString()}}, function(err, data){
                    if(err)
                        res.json({ret:false, err:true});
                    res.json({ret:true, outTime:outTime});
                })
            })
        }
    })
}
//Add Pid from the owner/pid
exports.addPid = function(req, res){
    //var placeName = req.body.placeName;
    //var ownerEmail = rep.user.local.email;
    //var placeName = ownerEmail.substring(0, ownerEmail.indexOf("@"));
    var userEmail = req.body.userEmail;
    var price = req.body.price;
    var avaliabilty = req.body.avaliabilty;
    //console.log(ownerEmail,placeName,userEmail,price,avaliabilty);
    var newBid = new BidModel();
    console.log("begin");
    newBid.userEmail = userEmail;
    newBid.price = price;
    newBid.avaliabilty = avaliabilty;
    newBid.status = "open";
    console.log("end");
    newBid.ownerEmail = req.user.local.email;
    console.log('ownerEmail');
    //newBid.placeName = ownerEmail.substring(0, ownerEmail.indexOf("@"));
    newBid.save(function(err){
        if(err)
            res.json({ret:false, err:true});
        else{
            res.json({ret:true});
        }
    });
}


//Change Password
exports.changePassword = function(req, res){
    var oldPassword = req.body.oldPassword;
    var newPassword = req.body.newPassword;
    var userEmail = req.user.local.email;
    UserModel.find({"local.email":userEmail, "local.password":generateHash(oldPassword)}).exec(function(err, data){
        if(err){
            console.log("Error in status update");
            res.json({ret:false});
        }
        else{
            UserModel.update({"local.email":userEmail}, {$set:{"local.password":generateHash(newPassword)}}, function(err, data){
                if(err)
                    res.json({ret:false, err:true});
                res.json({ret:true});
            })
        }
    })
}

function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
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