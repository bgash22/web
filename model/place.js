// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var placeSchema = mongoose.Schema({
    name:String,
    latitude:String,
    longitude:String,
    capacity:String,
    queue:String,
    category:String,
    subcategory:String,
    price:String,
    dir:String,
    places: String
});

// create the model for users and expose it to our app
module.exports = mongoose.model('place', placeSchema);
