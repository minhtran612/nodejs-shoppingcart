var express  = require('express');
var csrf     = require('csurf');
var Product  = require('../models/product');
var Order    = require('../models/order');
var Cart     = require('../models/cart');
var passport = require('passport');


var Userrouter = express.Router();
var csrfProtection = csrf();

Userrouter.use(csrfProtection);


Userrouter.get('/profile', isLoggedIn, function(req,res,next){
  Order.find({user: req.user}, function(err, orders) {
        if (err) {
            return res.write('Error!');
        }
        var cart;
        orders.forEach(function(order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });
        res.render('user/profile', { orders: orders });
  });
});
// SIGN OUT USER ============================================================
Userrouter.get('/logout', isLoggedIn, function(req,res,next){
  req.logOut();
  res.redirect('/');
}); 
// ALL THE OTHER USER ROUTE SHOULD NOT BE CHECKED LOGIN STATE
Userrouter.use('/', notLoggedIn, function(req, res, next){
    next();
});

// SIGN UP USER ============================================================
Userrouter.get('/signup',function(req,res,next){
  var message = req.flash('error');
  var hasErrors = (message.length > 0); 
  res.render('user/signup', {csrfToken : req.csrfToken(), messages: message, error: hasErrors});
}); 

Userrouter.post('/signup', passport.authenticate('local.signup', {
    failureRedirect: '/user/signup',
    failureFlash: true
}),function(req, res, next){
    if(req.session.oldUrl){
        req.session.oldUrl = null;
        res.redirect(req.session.oldUrl);      
    }else{
        return res.redirect('/user/profile');
    }
});
// SIGN IN USER ============================================================
Userrouter.get('/signin',function(req,res,next){
  var message = req.flash('error');
  var hasErrors = (message.length > 0); 
  res.render('user/signin', {csrfToken : req.csrfToken(), messages: message, error: hasErrors});
}); 

Userrouter.post('/signin', passport.authenticate('local.signin', {
    failureRedirect: '/user/signin',
    failureFlash: true
}), function(req, res, next){
    if(req.session.oldUrl){
        req.session.oldUrl = null;
        res.redirect(req.session.oldUrl);      
    }else{
        return res.redirect('/user/profile');
    }
}); 

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}

function notLoggedIn(req, res, next){
    if(!req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}

module.exports = Userrouter;
