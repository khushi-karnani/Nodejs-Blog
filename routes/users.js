var express = require('express');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var bodyParser= require('body-parser');
var morgan = require('morgan');
var ejs = require('ejs');
var User= require('../public/javascripts/models/user');
var config=require('../public/javascripts/config/database');
const mongoose = require("mongoose");
const { Passport } = require('passport');
var passportface = require("passport-facebook");
var passportconf=require('../public/javascripts/config/passport');
var app= express();
var cookieParser = require('cookie-parser');
var expiration=600000;

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(morgan('dev'));
app.use(passport.initialize());
app.use(passport.session());
  
app.set('view engine', 'ejs');

app.get('/login', function(req, res, next) {
  res.render('./login.ejs');
});

app.get('/register', function(req, res, next) {
  res.render('./register.ejs');
});

app.get('/profile',passport.authenticate('jwt',{session:false}), function(req,res){
  console.log('in profile');
  res.render('./profile.ejs',{user:req.user});
  //res.json({user: user.req});
});

app.get('/logout',function(req,res){
  res.clearCookie('access_token');
  res.redirect('/');
})

app.get("/list", (req, res, next) => {
  User.find()
      .exec()
      .then(users => {
        console.log(users);
          if (users.length >= 0) {
        res.status(200).json(users);
          } else {
              res.status(404).json({
                  message: 'No entries found'
              });
          }
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  });


  app.post("/register", (req, res, next) => {
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      email: req.body.email,
      fullname: req.body.name,
      password: req.body.password
    })
    User.createUser(user,function(err,user){
      if(err){
        res.render('../views/register.ejs',{
          err: err,
          msg: "user is not registered"
        })
      }else{
        var token= jwt.sign({sub: user._id},config.secret,{expiresIn:expiration});
          res.cookie('access_token', token);
        res.render('../views/register.ejs',{
          msg: "user is registered"
        })
      }
    });
  });

  
  app.post("/login", (req, res, next) => {
    var email=req.body.email;
    var password=req.body.password;
    User.getUserByEmail(email, function(err,user){
      if(err) {
        res.render('../views/login.ejs',{
          err: err,
        })};
      if(!user) {
        res.render('../views/login.ejs',{
          msg: "no user found",
        })
      }
      User.comparePassword(password, user.password,function(err,isMatch){
        if(err){
          res.render('../views/login.ejs',{
            err: err,
          })};
        if(isMatch) {
          var token= jwt.sign({sub: user._id},config.secret,{expiresIn:expiration});
          res.cookie('access_token', token, {
            httpOnly: true
          });
          res.redirect('/user/profile');
          /*res.json({
            success:true,
            token: 'JWT '+token,
            user:{id: user._id,
            email: user.email,
            password: user.password
            }
          });*/
        }
        else{
          res.render('../views/login.ejs',{
            msg: "credentials don't match"
          })
      };
      });
    });
  });

app.get('/auth/facebook', passport.authorize('facebook',{authType: 'rerequest',scope:['email']}));

//app.get('/auth/facebook', passport.authenticate('facebook',{scope:['email']}));

/*app.get('/auth/facebook/callback', function(req,res,next){
 passport.authenticate("facebook",function(err,profile,options){
    if(err){
      console.log(err);
      res.json({'err':err});
    }
  if(!profile){
    console.log('no profile');
    res.json({'err':'no profile'});
  }
  res.redirect('/');
  })
});*/

app.get('/auth/facebook/callback',passport.authenticate("facebook", { successRedirect: '/user/profile',
failureRedirect: '/' ,failureFlash: true}),function(req,res){
console.log('yess');
res.render('../views/login.ejs');
});

  module.exports=app;
  
