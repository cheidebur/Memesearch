var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2')
var userModel = require('../models/users').schema
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
	comment: String,
	authorName: String,
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	datePosted: {
		type: Date
	}
})


CommentSchema.plugin(mongoosePaginate)

var MemeComment = mongoose.model("MemeComment", CommentSchema)
module.exports = MemeComment;

