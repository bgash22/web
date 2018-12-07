// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var orderbSchema = mongoose.Schema({
    userEmail:String,
    orderTime:String,
    closeTime:String,
    ulat:String,
    ulog:String,
    gender:String,
    age:String,
    sick:String,
    status:String
});

// create the model for users and expose it to our app
module.exports = mongoose.model('orderb', orderbSchema);
