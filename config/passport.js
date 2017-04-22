var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

// used to serialize the user for the passport session
passport.serializeUser(function(user,done){
    done(null,user.id);
});

// used to deserialize the user,Attaching the loaded user object to the request as req.user.
passport.deserializeUser((id,done) => {
    User.findById(id,(err,user) => {  
        done(err,user);
    });
})

 
// =========================================================================
// REGISTER USER ===========================================================
// =========================================================================
passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty().isLength({min: 4});
    var errors = req.validationErrors();
    if(errors){
        var messages = [];
        errors.forEach(function(error){
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email}, function(err, user){
        if(err){
            done(err);
        }
        if(user){
            return done(null, false, {message: 'User already exists'}); 
        }
        var newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.save(function(err,user){
            if(err){
                done(err);
            }
            return done(null, newUser);
        });
    });
}));

// =========================================================================
// SIGN IN USER ============================================================
// =========================================================================

passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty().isLength({min: 4});
    var errors = req.validationErrors();
    if(errors){
        var messages = [];
        errors.forEach(function(error){
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email}, function(err, user){
        if(err){
            done(err);
        }
        if(user){
            if(user.validPassword(password)){
                return done(null, user, {message: "Login Successfully"});
            }
            else{
                return done(null, false, {message: 'Wrong Password'});
            }
        }
        else{
            return done(null, false, {message: 'Email not registered'}); 
        }
    });
}));