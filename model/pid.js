// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var pidSchema = mongoose.Schema({
    ownerEmail:String,
    placeName:String,
    userEmail:String,
    price:String,
    avaliabilty:String,
    bidTime:String,
    status:String
});

// create the model for users and expose it to our app
module.exports = mongoose.model('pid', pidSchema);