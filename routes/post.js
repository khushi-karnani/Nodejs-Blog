var config=require('../public/javascripts/config/database');
var express = require('express');
var router = express();
var ejs = require('ejs');
const multer = require('multer');
var path=require('path');
const mongoose= require('mongoose');
var passport = require('passport');
var passportconf=require('../public/javascripts/config/passport');
var jwt = require('jsonwebtoken');
var filepath='';

router.use(passport.initialize());
router.use(passport.session());
  

const storage = multer.diskStorage({
    destination: 'C:/Users/DELL/node-examples/express-project1/public/images/uploads/',
    filename: function(req, file, cb){
      cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });

  function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
  
    if(mimetype && extname){
      return cb(null,true);
    } else {
      cb('Error: Images Only!');
    }
  }

  const upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: function(req, file, cb){
      checkFileType(file, cb);
    }
  }).single('myImage');
  
  var Post = require('../public/javascripts/models/posts');
  var Comment = require('../public/javascripts/models/comments');

router.get('/',function(req, res, next) {
    res.render('./home.ejs');
  });

router.get('/addpost',function(req, res, next) {
    res.render('./add_post.ejs');
  });

  router.get('/edit/:postid',passport.authenticate('jwt',{session:false}),function(req, res, next) {
    const id = req.params.postid;
    Post.findById(id)
    .exec()
    .then(doc => {
      if (doc) {
    res.render('./editPost.ejs',{postdetail:doc});
  }
}).catch(err => {
  console.log(err);
  res.status(500).json({
    error: err
  });
}); 
});

router.post('/addpost', (req, res, next) => {
    const post = new Post({
      blogtitle: req.body.blogtitle,
      blogcontent: req.body.blogcontent,
      blogimage: filepath
    })
    post
    .save()
    .then(newpost => {
      Post.find()
      .exec()
      .then(posts => {
           if (posts.length >= 0) {
            res.render('./home.ejs',{posts: posts, msg:"new post added"});
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
        })
    .catch(err => {
      res.render('./add_post.ejs',{
        err: err,
        msg: "post not added"
      });
    });
});

router.post('/addpost/upload', (req, res) => {
  upload(req, res, (err) => {
    if(err){
      res.render('./add_post.ejs', {
        message: err
      });
    } else {
      if(req.file == undefined){
        res.render('./add_post.ejs', {
          message: 'Error: No File Selected!'
        });
      } else {
        filepath=`/images/uploads/${req.file.filename}`;
        res.render('./add_post.ejs', {
          message: 'File Uploaded!',
          file: filepath
        });
      }
    }
  });
});

router.get('/list', (req, res) => {
  Post.find()
    .exec()
    .then(posts => {
         if (posts.length >= 0) {
      res.json(posts);
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

router.get('/:postid', (req, res, next) => {
  const id = req.params.postid;
  console.log('i am here')
  Post.findById(id)
    .exec()
    .then(doc => {
      if (doc) {
      Comment.find({postId:id})
    .exec()
    .then(comments=> {
      if (comments) {
        res.render('./showPost',{postdetail: doc,comments:comments});
      } else {
        res.render('./showPost',{postdetail: doc});
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.post('/:postid', (req, res, next) => {
  var id = req.params.postid;
  var comment = new Comment({
    comment: req.body.comment,
    postId: id
  })
  comment
  .save()
  .then(newcomment => {
    console.log(newcomment);
    Post.findById(id)
    .exec()
    .then(doc => {
      if (doc) {
        Comment.find({postId:id})
    .exec()
    .then(comments=> {
      if (comments) {
        res.render('./showPost',{postdetail: doc,comments:comments});
      } else {
        res.render('./showPost',{postdetail: doc});
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
    
    })
  .catch(err => {
    res.render('./showPost.ejs',{
      err: err,
      msg: "comment not added"
    });
  });
});

router.get('/comments',(req, res) => {
  Comment.find()
    .exec()
    .then(comments => {
         if (comments.length >= 0) {
      res.json(comments);
        } else {
            res.status(404).json({
                message: 'No entries found'
            });
        }
      }
    )
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post('/:postid/edit', (req, res, next) => {
  const id = req.params.postid;
  var updated={blogtitle: req.body.blogtitle,
    blogcontent: req.body.blogcontent}
  Post.update({ _id: id }, { $set: updated })
    .exec()
    .then(result => {
      res.status(200).json({
          message: 'Post updated'
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post('/:postid/delete',passport.authenticate('jwt',{session:false}), (req, res, next) => {
  console.log('delete')
  const id = req.params.postid;
  Post.remove({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json({
          message: 'This post has been deleted',
          request: {
              type: 'delete',
          }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});


module.exports = router;