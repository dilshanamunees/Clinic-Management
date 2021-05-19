const passport = require('passport');
var auth           =     require('../config/auth')
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const facebookStrategy = require('passport-facebook').Strategy
var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectID
const bcrypt = require('bcrypt')
var flash = require("connect-flash")

passport.serializeUser(function (user, done) {
   done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: auth.googleAuth.clientID,
    clientSecret: auth.googleAuth.clientSecret,
    callbackURL: auth.googleAuth.callbackURL,
  passReqToCallback: true
},
  function (request, accessToken, refreshToken, profile, done) {
    console.log(profile)
    process.nextTick(function () {
      db.get().collection(collection.USER_COLLECTION).findOne({email: profile._json.email }, function (err, user) {

        if (user) {
          console.log("user found")
          console.log(user)
          return done(null, user); // user found, return that user  
        }
        else {
          db.get().collection(collection.USER_COLLECTION).insertOne({ name: profile.displayName, email: profile._json.email })
        }
        return done(null, profile)


      }

      )

    })
  }
));
passport.use(new facebookStrategy({

  // pull in our app id and secret from our auth.js file
  clientID: auth.facebookAuth.clientID,
  clientSecret: auth.facebookAuth.clientSecret,
  callbackURL: auth.facebookAuth.callbackURL,
  profileFields: ['displayName', 'email']

},// facebook will send back the token and profile
  function (token, refreshToken, profile, done) {
    console.log(profile)
    console.log( profile._json.email)
    console.log( profile.displayName)

    process.nextTick(function () {
      db.get().collection(collection.USER_COLLECTION).findOne({ email: profile._json.email }, function (err, user) {

        if (user) {
          console.log("user found")
          console.log(user)
          return done(null, user); // user found, return that user  
        }
        else {
          db.get().collection(collection.USER_COLLECTION).insertOne({ name: profile.displayName, email: profile._json.email,id:profile._json.id })
        }
        return done(null, profile)
      }

      )

    })


  }));
passport.use(new LocalStrategy({
 
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback : true
},
  function (req,email, password, done) {
   // console.log("login......")
   //console.log(email)
     //console.log(password)
    db.get().collection(collection.USER_COLLECTION).findOne({ email: email }, function (err, user) {
    
     
      if (user) {
        if (user.password) {
          bcrypt.compare(password, user.password).then((status) => {
            if (status) {
              
              return done(null, user);
            }
            else {
              //console.log("login failed")
              // return done(null, false, { message: 'Incorrect password' })
              return done(null, false, req.flash('error','Incorrect username or password' ))
            }
          })
        }
        else {
          //console.log("login failed, incorrect password")
          // return done(null, false, { message: 'Incorrect password' })
          return done(null, false, req.flash('error','Incorrect username or password' ))
        }

      } else {
       // console.log("login failed, incorrect user")
        // return done(null, false, { message: 'Incorrect username.' });
        return done(null, false, req.flash('error','Incorrect username or password' ))
      }

    });
  }
));