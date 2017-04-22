var express  = require('express');
var Product  = require('../models/product');
var Cart     = require('../models/cart');
var Order    = require('../models/order');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var successMsg = req.flash('success')[0];
  Product.find(function(err,findResult){
    res.render('index',{products : findResult, sMsg: successMsg, hasSucess: !successMsg});
  });
});

router.get('/add-to-cart/:id', function(req, res, next) {
    var productID = req.params.id; 
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    Product.findById(productID, function(err,product){
        if(err){
          res.redirect('/');
        }
        cart.add(product, product.id);
        req.session.cart = cart;
        res.redirect('/');
  });
});

router.get('/shopping-cart', function(req, res, next) {
    if(!req.session.cart){
      return res.render('shopping-cart', {products: null});
    }
    var cart = new Cart(req.session.cart);
    var products = cart.generateArray();
    return res.render('shopping-cart', { products: cart.generateArray(), totalPrice: cart.totalPrice});
});

router.get('/check-out', isLoggedIn, function(req, res, next) {
    if(!req.session.cart){
      return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];
    return res.render('check-out',{totalPrice: cart.totalPrice, err: errMsg, noError: !errMsg});
});

router.post('/check-out', isLoggedIn, function(req, res, next) {
    if(!req.session.cart){
      return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    var stripe = require("stripe")(
        "sk_test_PjGHkZvqU2Ruepv2HLwsn0qt"
    );
    console.log("req.body.stripeToken ", req.body.stripeToken);
    stripe.charges.create({
        amount: cart.totalPrice * 100,
        currency: "usd",
        source: req.body.stripeToken, // obtained with Stripe.js
        description: "Test charge"
      }, function(err, charge) {
         if(err) {
            req.flash('error', err.message);
            return res.redirect('/check-out');
         }
         //initialize new Order
         var order = new Order({
             user       : req.user,
             cart       : cart    ,
             address    : req.body.address,
             name       : req.body.name,
             paymentid  : charge.id
         });

         order.save(function(err, result){
              req.flash('success', 'Payment completed. Your order has been placed');
              req.session.cart = null;
              return res.redirect('/');
         });  
    });
});


router.get('/reduce/:id', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/remove/:id', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}

module.exports = router;
