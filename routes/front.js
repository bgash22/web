var express = require('express');
var router = express.Router();
var passport = require('passport');
var flash    = require('connect-flash');

var front = require('../controller/front');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('front/login.ejs', { message: req.flash('loginMessage') });
});

router.post('/login', passport.authenticate('local-login', {
    successRedirect : '/front/orders',
    failureRedirect : '/front',
    failureFlash: true
}));

router.get('/orders', isLoggedIn, front.orders);

//Order status Change
router.post('/orderStatus', isLoggedIn, front.orderStatus);

//Book Ajax Call
router.post('/book', isLoggedIn, front.book);
router.post('/search', isLoggedIn, front.search);
router.post('/qbook', isLoggedIn, front.qbook);



//Change Password
router.post('/changePassword', isLoggedIn, front.changePassword);
//Log out
router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/front');
})

//Middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated() && req.user.role == 'front'){
        return next();
    }
    res.redirect('/front');
}
module.exports = router;
