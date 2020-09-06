var express = require('express');
var router = express();
const cookieParser = require('cookie-parser');
var ejs = express('ejs');
var Post= require('../public/javascripts/models/posts'); 

const mongoose= require('mongoose');


router.use(express.static('./public'));
router.use(cookieParser());

router.set('view engine', 'ejs');

/* GET home page. */

router.get('/', function(req, res, next) {
  Post.find()
      .exec()
      .then(posts => {
           if (posts.length >= 0) {
            res.render('./home.ejs',{posts: posts});
          } else {
              res.status(404).json({
                  message: 'No entries found'
              });
          }
        });
});

router.get('/showPost', function(req, res, next) {
  res.render('./showPost.ejs');
});
module.exports = router;


