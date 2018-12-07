var UserModel = require('../model/user');
var PlaceModel = require('../model/place');
var OrderModel = require('../model/order');
var bcrypt   = require('bcrypt-nodejs');

//Queues
exports.queues = function(req, res){
    var queueEmail = req.user.local.email;
    console.log(queueEmail);
    OrderModel.find({placeName:queueEmail.substring(0, queueEmail.indexOf("@")),status:"checkin"}).exec(function(err, data){
        console.log(JSON.stringify(data, null, 4));
        res.render('queue/queues.ejs', {queues:data})
    })
}



//Order Status Change
exports.orderStatus = function(req, res){
    //console.log("Here");
    var placeName = req.body.placeName;
    var userEmail = req.body.email;
    var status = req.body.status;
    var outTime = status == "False"?getDateTime():"";
    OrderModel.update({placeName:placeName, userEmail:userEmail}, {$set:{status:status, outTime:outTime}}, function(err, data){
        if(err)
            res.json({ret:false});
        else{
            PlaceModel.find({name:placeName}).exec(function(err, data){
                var queue;
                if(status == "True")
                    queue = parseInt(data[0].queue) +1;
                else
                    queue = parseInt(data[0].queue) -1;
                PlaceModel.update({name:placeName}, {$set:{queue:queue.toString()}}, function(err, data){
                    if(err)
                        res.json({ret:false, err:true});
                    res.json({ret:true, outTime:outTime});
                })
            })
        }
    })
}

//Find order is already made.
exports.search = function(req, res){
    var placeName = req.body.placeName;
    var userEmail = req.body.userEmail;
    console.log(placeName);
    OrderModel.find({placeName:placeName,userEmail:userEmail,status:"book"}).exec(function(err, data){
        if(data.length != 0){
            OrderModel.update({placeName:placeName,userEmail:userEmail,status:"book"}, {$set:{status:"confirm"}}, function(err, data){
                //console.log(JSON.stringify(data[0].status, null, 4));
                if(err){
                    console.log(err);
                }
                else {
                    console.log(data[0]);
                }

            })

            res.json({ret:true, number:data[0].number});
        }
        else {
            res.json({ret:false});
        }
    })
}


//Find order is already made.
exports.book = function(req, res){
    var placeName = req.body.placeName;
    console.log(placeName);
    OrderModel.find({placeName:placeName}).exec(function(err, data){
        if(data.length != 0){
            console.log("inside");
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
    var userEmail = req.body.userEmail;
    var age = req.body.age;
    var dress = req.body.dress;
    var color = req.body.color;
    var number = req.body.bookNum;
    console.log(number);

    OrderModel.find({placeName:placeName, userEmail:userEmail}).exec(function(err, data){
        if(data.length != 0){
            res.json({ret:false});
        }
        else {
            var newOrder = new OrderModel();
            newOrder.placeName = placeName;
            newOrder.userEmail = userEmail;
            newOrder.age = age;
            newOrder.dress = dress;
            newOrder.color = color;
            newOrder.number = number;
            newOrder.orderTime = getDateTime();
            newOrder.status = "confirm";
            newOrder.save(function(err){
                if(err)
                    res.json({ret:false, err:true});
                else{
                    PlaceModel.find({name:placeName}).exec(function(err, data){
                        var queue = parseInt(data[0].queue) + 1;
                        PlaceModel.update({name:placeName}, {$set:{queue:queue.toString()}}, function(err, data){
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