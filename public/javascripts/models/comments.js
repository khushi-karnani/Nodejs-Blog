var mongoose = require('mongoose');
const CommentSchema= mongoose.Schema({
     comment: {
         type: String,
     },
     postId: String
});
module.exports = mongoose.model('Comments', CommentSchema);