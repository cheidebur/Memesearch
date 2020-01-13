const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var mongoosePaginate = require('mongoose-paginate-v2');
var Meme = require('../models/memes');
var Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

var FavSchema = new mongoose.Schema({
	memeId: {
		type: Schema.Types.ObjectId,
		ref: "Meme"
	},
	dateAdded: {
		type: Date,
		
	}
});

var FriendSchema = new mongoose.Schema({
	dateAdded: {
		type: Date
	},
	friendUsername: String,
	friendId: {
		type: Schema.Types.ObjectId,
		ref: "User"
	}

})

const tokenSchema = new mongoose.Schema({
	userId: { 
		type: mongoose.Schema.Types.ObjectId,
		required:true,
		ref: "User"
	},
	token: {
		type: String,
		required: true
	},
	createdAt: {
		type: Date,
		required: true,
		default: Date.now,
		expires: 43200
	}
})

var UserSchema = new mongoose.Schema({
	email: {
		type: String,
		unique: true,
		trim: true,
		maxlength: 35,
		lowercase: true
	},
	username: {
		type: String,
		unique: true,
		trim: true,
		maxlength: 15
		},
	
	passwordHash: {
		type: String,
		required: true
	},
	isVerified: {
		type: Boolean,
		default: false
	},
	blurb: {
		type: String,
		default: "Every day, we stray further from god"
	},
	avvy: {
		type: String,
		default: "https://res.cloudinary.com/dx3ezvpsy/image/upload/v1569401629/y43kxrft9uehigpk1bam.jpg"
	},
	favs: [FavSchema],
	clout: {type: Number, default: 0},
	friends: [FriendSchema],
	friendRequests: [FriendSchema]
});

UserSchema.plugin(uniqueValidator);
//delete user's favorites upon acct deletion
/*  const app = await App.findOne({ _id: req.params['id']}).exec()
  const listToDelete = [...app.appClients]

  await App.deleteOne({ _id: req.params['id']}).exec()
  await AppClient.remove({_id: {$in: listToDelete}}).exec()
*/
UserSchema.pre('remove', function(next) {
	console.log("DELETING MEMES ASSOCIATED WITH THIS ACCOUNT");
	Meme.remove({imageUploader: this.username})
	.then(function(query) {
		console.log("removed ", query);
	})
	next();
})
//add valid password method for auth
UserSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.passwordHash)
}
//add virtual password field for comparing entered password with saved hash
UserSchema.virtual("password").set(function(value) {
	this.passwordHash = bcrypt.hashSync(value, saltRounds);
})

UserSchema.plugin(mongoosePaginate);
FavSchema.plugin(mongoosePaginate);
FriendSchema.plugin(mongoosePaginate);

var Token = mongoose.model('Token', tokenSchema)
var User = mongoose.model('User', UserSchema);
var MemeFav = mongoose.model('FavMeme', FavSchema);
var Friend = mongoose.model('Friend', FriendSchema);
module.exports.User = User;
module.exports.MemeFav = MemeFav;
module.exports.Friend = Friend;
module.exports.tokenSchema = Token;