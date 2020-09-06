var mongoose = require('mongoose');
const PostSchema= mongoose.Schema({
     blogtitle: String,
     blogcontent: {
         type: String,
         required: true,
     },
     blogimage: String
});
module.exports = mongoose.model('Posts', PostSchema);