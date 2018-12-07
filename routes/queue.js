var express = require('express');
var router = express.Router();
var passport = require('passport');
var flash    = require('connect-flash');

var queue = require('../controller/queue');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('queue/login.ejs', { message: req.flash('loginMessage') });
});

router.post('/login', passport.authenticate('local-login', {
    successRedirect : '/queue/queues',
    failureRedirect : '/queue',
    failureFlash: true
}));

router.get('/queues', isLoggedIn, queue.queues);

//Order status Change
/*router.post('/orderStatus', isLoggedIn, front.orderStatus);

//Book Ajax Call
router.post('/book', isLoggedIn, front.book);
router.post('/search', isLoggedIn, front.search);
router.post('/qbook', isLoggedIn, front.qbook);*/



//Change Password
router.post('/changePassword', isLoggedIn, queue.changePassword);
//Log out
router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/queue');
})

//Middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated() && req.user.role == 'queue'){
        return next();
    }
    res.redirect('/queue');
}
module.exports = router;
