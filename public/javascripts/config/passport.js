var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var passport = require('passport');
var User= require("../models/user");
var config = require("./database");
var configauth= require('./auth');

//const FacebookTokenStrategy = require('passport-facebook-token');

const cookieExtractor = req => {
    let newtoken = null;
    if (req && req.cookies) {
      newtoken = req.cookies['access_token'];
    }
    return newtoken;
  }

passport.use(new JwtStrategy({
    jwtFromRequest: cookieExtractor,
    secretOrKey: config.secret
    }, function(payload, done) {
        User.getUserById(payload.sub, function(err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
                // or you could create a new account
            }
        });
    }));

var FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: configauth.facebookauth.clientID,
    clientSecret: configauth.facebookauth.clientSecret,
    callbackURL: configauth.facebookauth.callbackURL,
    profileFields: ['id', 'emails', 'name']
  },
  function(accessToken, refreshToken, profile, done) {
      process.nextTick(function(){
        User.findOne({ "facebook.id": profile.id },function(err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            } else {
                var newUser= new User();
                newUser.facebook.id=profile.id;
                newUser.facebook.token=accessToken;
                newUser.facebook.name=profile.name.givenName+' '+profile.name.familyName;
                newUser.facebook.email=profile.emails[0].value;
    
                newUser.save(function(err){
                    if(err) throw err;
                    return done(null,newUser)
                })
            }
        });
      });
      console.log(profile);
      console.log('accessToken', accessToken);
    //return done(null,profile)
  }
));

   /* passport.use('facebookToken', new FacebookTokenStrategy({
        clientID: config.oauth.facebook.clientID,
        clientSecret: config.oauth.facebook.clientSecret,
        passReqToCallback: true,
        profileFields: ['id', 'emails', 'name']
      }, async (req, accessToken, refreshToken, profile, done) => {
        try {
          console.log('profile', profile);
          console.log('accessToken', accessToken);
          console.log('refreshToken', refreshToken);
          
          if (req.user) {
            // We're already logged in, time for linking account!
            // Add Facebook's data to an existing account
            req.user.methods.push('facebook')
            req.user.facebook = {
              id: profile.id,
              email: profile.emails[0].value
            }
            await req.user.save();
            return done(null, req.user);
          } else {
            // We're in the account creation process
            let existingUser = await User.findOne({ "facebook.id": profile.id });
            if (existingUser) {
              return done(null, existingUser);
            }
      
            // Check if we have someone with the same email
            existingUser = await User.findOne({ "local.email": profile.emails[0].value })
            if (existingUser) {
              // We want to merge facebook's data with local auth
              existingUser.methods.push('facebook')
              existingUser.facebook = {
                id: profile.id,
                email: profile.emails[0].value
              }
              await existingUser.save()
              return done(null, existingUser);
            }
      
            const newUser = new User({
              methods: ['facebook'],
              facebook: {
                id: profile.id,
                email: profile.emails[0].value
              }
            });
      
            await newUser.save();
            done(null, newUser);
          }
        } catch(error) {
          done(error, false, error.message);
        }
      }));*/
