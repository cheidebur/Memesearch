var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2')
var userModel = require('../models/users').schema
var Schema = mongoose.Schema;
CommentSchema = require('../models/comment').schema

var FavMemeSchema = new Schema({

    memeInDatabase: {type: Schema.Types.ObjectId, ref: 'Meme'},
    dateFavorited: {
    	type: Date,
    	default: Date.now
    }
});


FavMemeSchema.plugin(mongoosePaginate);

var FavMeme = mongoose.model("FavMeme", FavMemeSchema);
module.exports = FavMeme;

