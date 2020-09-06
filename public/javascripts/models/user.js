var mongoose= require('mongoose');
var config = require("../config/database");
var bcrypt = require('bcryptjs');

const userSchema= mongoose.Schema({
     email: {
         type: String,
         //required: true,
         unique: true
     },
     fullname: String,
     password: {
        type: String,
        //required: true,
        minlength: 6
     },
     facebook: {
        id: {
          type: String
        },
        token: String,
        email: {
          type: String,
          //lowercase: true
        },
        name: String
      }
});

var User= module.exports= mongoose.model('User',userSchema);

module.exports.getUserById = function(id,cb){
    User.findById(id,cb);
}

module.exports.getUserByEmail = function(email,cb){
    User.findOne({email: email},cb);
}

module.exports.createUser = function(newUser,cb){
    bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(newUser.password, salt, function(err, hash){
            if(err) throw err;
            newUser.password= hash;
            newUser.save(cb);
        })
    })
}

module.exports.comparePassword = function(mypassword,hash,cb){
    bcrypt.compare(mypassword, hash, function(err, isMatch){
        if(err) throw err;
        cb(null,isMatch);
    })
}