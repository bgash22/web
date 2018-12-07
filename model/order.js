// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var orderSchema = mongoose.Schema({
    placeName:String,
    userEmail:String,
    gender:String,
    age:String,
    sick:String,
    number:String,
    bookTime:String,
    confirmTime:String,
    checkinTime:String,
    closeTime:String,
    status:String
});

// create the model for users and expose it to our app
module.exports = mongoose.model('order', orderSchema);
