var UserModel = require('../model/user');
var PlaceModel = require('../model/place');
var OrderModel = require('../model/order');
var OrderbModel = require('../model/orderb');
// var bcrypt   = require('bcrypt-nodejs');
var Express = require('express');
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');
var uniqid = require('uniqid');
// var multer = require('multer');
// var bodyParser = require('body-parser');
// var fs = require('file-system');
// var app = Express();
// app.use(bodyParser.json({limit: '50mb'}));
// app.use(bodyParser.urlencoded({
//   limit: '50mb',
//   extended: true,
//   parameterLimit:50000
// }));


exports.user = function (req, res) {
    UserModel.find({
        role: 'user'
    }).exec(function (err, data) {
        res.render('admin/user.ejs', {
            users: data
        });
    })
}

//Update User status from admin panel/user
exports.updateStatus = function (req, res) {
    var email = req.body.email;
    var status = req.body.status;
    UserModel.findOneAndUpdate({
        "local.email": email
    }, {
        status: status
    }, {
        new: true,
        upsert: true
    }, function (err, data) {
        if (err) {
            console.log("Error in status update");
            res.json({
                ret: false
            });
        } else {
            res.json({
                ret: true
            });
        }
    })
}

//Delete User from adminpanel/user
exports.deleteUser = function (req, res) {
    var email = req.body.email;
    UserModel.find({
        "local.email": email
    }).remove().exec(function (err, data) {
        if (err) {
            res.json({
                ret: false
            });
        } else {
            res.json({
                ret: true
            });
        }
    });
}

//Places response Places in the left-side bar
exports.places = function (req, res) {
    PlaceModel.find().exec(function (err, data) {
        res.render('admin/place.ejs', {
            places: data
        });
    });
}

//Add Place from the adminpanel/place
exports.addPlace = function (req, res) {
    // console.log('inside');
    // var name = req.body.placeName.toLowerCase();
    // console.log(name);
    // var latitude = req.body.placeLatitude;
    // var longitude = req.body.placeLongitude;
    // var capacity = req.body.placeCapacity;
    // var price = req.body.placePrice;
    var name, latitude, longitude, capacity, price, directory, upath;
    var form = new formidable.IncomingForm();
    directory = uniqid();
    upath = appRoot + '/public/uploads/' + directory + '/';
    fs.mkdirSync(upath);

    form.parse(req, function (err, fields, files) {
        name = fields.placeName;
        // console.log(name);
        latitude = fields.placeLatitude;
        longitude = fields.placeLongitude;
        capacity = fields.placeCapacity;
        price = fields.placePrice;
        // console.log(fields);
        // console.log('after form parse');
        // console.log(fields.placeName);
        // console.log(fields.placeLatitude);
        var p = [];
        var index = 0;
        // console.log(directory);
        while (files['file' + index] != undefined) {
            p.push(new Promise((resolve, reject) => {
                filename = uniqid();
                // console.log(directory);
                // console.log(upath);
                var old_path = files['file' + index].path;
                var file_size = files['file' + index].size;
                var file_ext = files['file' + index].name.split('.').pop();
                var new_path = path.join(appRoot, '/public/uploads/', directory, filename + '.' + file_ext);
                // var new_path = path.join(__dirname, '/public/uploads/', directory , '/' );
                // console.log(new_path);
                fs.readFile(old_path, function (err, data) {
                    fs.writeFile(new_path, data, function (err) {
                        fs.unlink(old_path, function (err) {
                            if (err) {
                                console.log('uploading failure!');
                                // reject()
                            } else {
                                console.log('uploading success!');
                                resolve(path.join('/public/uploads/', directory, filename + '.' + file_ext))
                            }
                        });
                    });
                });
            }))
            index++;
        }
        // console.log(name);
        var dir = path.join(appRoot, '/public/uploads/', directory, '/');
        console.log(dir);
        Promise.all(p).then((places) => {
            PlaceModel.update({
                name: name
            }, {
                $setOnInsert: {
                    name: name,
                    latitude: latitude,
                    longitude: longitude,
                    capacity: capacity,
                    price: price,
                    dir: dir,
                    queue: "0",
                    places: places.join(',')
                }
            }, {
                upsert: true
            }).exec(function (err, data) {
                if (err)
                    res.json({
                        ret: false
                    });
                else {
                    var newUser = new UserModel();
                    newUser.local.email = name + "@owner.com";
                    newUser.local.password = newUser.generateHash("owner");
                    newUser.status = 'active';
                    newUser.role = 'owner';
                    newUser.save(function (err) {
                        if (err) {
                            res.json({
                                ret: false
                            });
                        } else {
                            res.json({
                                ret: true
                            });
                        }
                    });

                    var frontUser = new UserModel();
                    frontUser.local.email = name + "@front.com";
                    frontUser.local.password = frontUser.generateHash("front");
                    frontUser.status = 'active';
                    frontUser.role = 'front';
                    frontUser.save(function (err) {
                        if (err) {
                            //res.json({ret:false});
                        } else {
                            // res.json({ret:true});
                        }
                    });
                    var frontUser = new UserModel();
                    frontUser.local.email = name + "@queue.com";
                    frontUser.local.password = frontUser.generateHash("queue");
                    frontUser.status = 'active';
                    frontUser.role = 'queue';
                    frontUser.save(function (err) {
                        if (err) {
                            //res.json({ret:false});
                        } else {
                            // res.json({ret:true});
                        }
                    });
                }
            })
        })

    })
    // console.log(directory);

}
//Delete Place
exports.deletePlace = function (req, res) {
    var name = req.body.name.toLowerCase();
    PlaceModel.find({
        name: name
    }).remove().exec(function (err, data) {
        if (err)
            res.json({
                ret: false
            });
        else {
            UserModel.find({
                "local.email": name.toLowerCase() + "@owner.com"
            }).remove().exec(function (err, data) {
                if (err) {
                    res.json({
                        ret: false
                    });
                } else {
                    res.json({
                        ret: true
                    });
                }
            });
        }
    })
}

//Orders
exports.orders = function (req, res) {
    OrderModel.find().exec(function (err, data) {
        res.render('admin/order.ejs', {
            orders: data
        })
    })
}

//Delete existing order
exports.deleteOrder = function (req, res) {
    var placeName = req.body.placeName;
    var userEmail = req.body.userEmail;
    OrderModel.find({
        placeName: placeName,
        userEmail: userEmail
    }).remove().exec(function (err, data) {
        if (err)
            res.json({
                ret: false
            });
        else {
            res.json({
                ret: true
            });
        }
    })
}
//Order Status Change
exports.orderStatus = function (req, res) {
    console.log("Here");
    var placeName = req.body.placeName;
    var userEmail = req.body.email;
    var status = req.body.status;
    var outTime = status == "False" ? getDateTime() : "";
    OrderModel.update({
        placeName: placeName,
        userEmail: userEmail
    }, {
        $set: {
            status: status,
            outTime: outTime
        }
    }, function (err, data) {
        if (err)
            res.json({
                ret: false
            });
        else {
            PlaceModel.find({
                name: placeName
            }).exec(function (err, data) {
                var queue;
                if (status == "True")
                    queue = parseInt(data[0].queue) + 1;
                else
                    queue = parseInt(data[0].queue) - 1;
                PlaceModel.update({
                    name: placeName
                }, {
                    $set: {
                        queue: queue.toString()
                    }
                }, function (err, data) {
                    if (err)
                        res.json({
                            ret: false,
                            err: true
                        });
                    res.json({
                        ret: true,
                        outTime: outTime
                    });
                })
            })
        }
    })
}

//Change Password
exports.changePassword = function (req, res) {
    var oldPassword = req.body.oldPassword;
    var newPassword = req.body.newPassword;
    var userEmail = req.user.local.email;
    UserModel.find({
        "local.email": userEmail,
        "local.password": generateHash(oldPassword)
    }).exec(function (err, data) {
        if (err) {
            console.log("Error in status update");
            res.json({
                ret: false
            });
        } else {
            UserModel.update({
                "local.email": userEmail
            }, {
                $set: {
                    "local.password": generateHash(newPassword)
                }
            }, function (err, data) {
                if (err)
                    res.json({
                        ret: false,
                        err: true
                    });
                res.json({
                    ret: true
                });
            })
        }
    })
}

function generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
//Get current time.
function getDateTime() {
    var d = new Date(),
        minutes = d.getMinutes().toString().length == 1 ? '0' + d.getMinutes() : d.getMinutes(),
        hours = d.getHours().toString().length == 1 ? '0' + d.getHours() : d.getHours(),
        ampm = d.getHours() >= 12 ? 'pm' : 'am',
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[d.getDay()] + ' ' + months[d.getMonth()] + ' ' + d.getDate() + ' ' + d.getFullYear() + ' ' + hours + ':' + minutes + ampm;
}