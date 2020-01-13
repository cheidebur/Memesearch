var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2')
var userModel = require('../models/users').schema
var Schema = mongoose.Schema;
CommentSchema = require('../models/comment').schema

var MemeSchema = new Schema({
	imageTags: [String],
    imageUrl: String,
    imageUploader: String,
    favorited: {
    	type: Number,
    	default: 1
    },
    memeId: String,
    date: {
    	type: Date,
    	default: Date.now
    },
    comments: [CommentSchema],
    author: {type: Schema.Types.ObjectId, ref: 'User'}
});


MemeSchema.plugin(mongoosePaginate);

var Meme = mongoose.model("Meme", MemeSchema);
module.exports = Meme;

