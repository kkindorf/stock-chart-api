const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');



//create local strategy
//localOptions tells passport-local to look at the email property of the request
const localOptions = { usernameField: 'email' };
const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
    // verify this username and password
    //call done with the user
    //otherwise call done with false
    User.findOne({email: email}, function(err, user) {
        if(err) {
            return done(err);
        }
        if(!user) {
            return done(null, false);
        }
        //compare passwords - is password equal to user.password?
        user.comparePassword(password, function(err, isMatch) {
            if(err) {
                return done(err);
            }
            if(!isMatch) {
                return done(null, false);
            }
            else {
                return done(null, user);
            }
        })
    })
});
//setup options for jwrt strategy
const jwtOptions = { 
    //tells passport to look at the request header and specifically authorization
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.secret
 };

//create jwt strategy
//ayload.sub is found based on the subject property we encoded with original token response after signing up
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
    // see if the user ID in the payload exists in our database
    //if it does call done with that user
    //otherwise call done without a user object
    User.findById(payload.sub, function(err, user) {
        if(err) {
            return done(err, false);
        }
        if(user) {
            done(null, user);
        }
        else {
            done(null, false);
        }
    })
})


//tell passport to use this strategy
passport.use(localLogin);
passport.use(jwtLogin);