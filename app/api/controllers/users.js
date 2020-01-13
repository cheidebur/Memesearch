var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var session = require('express-session')
var memeModel = require('../models/memes');
var userSchemas = require('../models/users');
var userModel = userSchemas.User
var NewFriend = userSchemas.Friend;
var Token = userSchemas.tokenSchema;
var express = require('express');
var ObjectId = require('mongoose').Types.ObjectId; 
var path = require('path');
var crypto = require('crypto');
//sendgrid
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const passport = require('passport');

const {check, validationResult} = require('express-validator/check');


const errorFormatter = ({msg}) => {
	return `${msg}`;
}

module.exports = {
	validateCreate: function(method) {
		console.log("validateCreate function log lol")
		switch(method) {
			case 'create': {
				return [
				check('email', 'enter a valid email pls').isEmail().normalizeEmail(),
				check('username', '5 character minimum for usernames').isLength({min: 5}),
				check('password', '7 character minimum for passwords').isLength({min: 5})
				]
			}
			break;
			case 'confirmationEmail': {
				return [
				check('loginemail', 'enter a valid email').isEmail().normalizeEmail()
				]
			}
			break;
		}
	},
	create: function(req, res, next) {
		console.log("create acct function");
		//variables
		const filePath = "./views/main/register.hbs";
		const resolvedPath = path.resolve(filePath);
		const emailCase = req.body.email; //removed toLower
		console.log("creating account for ", emailCase);
		//validation result
		const result = validationResult(req).formatWith(errorFormatter);
		if (!result.isEmpty()) {
			console.log("there were errors validating the email")
			return res.render(resolvedPath, {errors: result.array()});
		}
		//checks for existing verified accts with this email;
		userModel.findOne({email: emailCase, isVerified: true}).then(function(usr) {
			if (usr) {
			 	return res.render(resolvedPath, {errors: ["this email is already registered :/"]});
			} 				
		})
		//deletes unverified user (?? what was I doing here)
		userModel.deleteOne({email: emailCase}).then(function(unverified) {
			console.log("user not verified - sending new verification token");
			
		})
		//check if username available
		userModel.findOne({username: req.body.username}).then(function(usr) {
			if (usr) return res.render(resolvedPath, {errors: ["username not available :/"]});
		})
		console.log(req.body.username);
		userModel.create({ 
			username: req.body.username,
			email: emailCase,
			password: req.body.password,
			favorites: [memeModel],
			memePoints: 0
			}, function (err, usr) {
				  if (err) return console.log("error creating user ", err);
				 const newToken = new Token({
				  	userId: usr._id,
				  	token: crypto.randomBytes(16).toString('hex'),
				  })
				  console.log("hey puta, saving verification token ", newToken);
				  newToken.save(function(err) {
				  	if (err) console.log("err saving token");
				  	console.log("saved token i think ");
				  	// sendgrid booshit
					const msg = {
					  to: emailCase,
					  from: 'chase@memesearch.net',
					  subject: 'verify your memesearch account',
					  html: 'Hi!\n\n' + 'Verify your memesearch acct: \nhttp:\/\/' + req.headers.host + '\/confirmation-form\/' + newToken.token + '.\n',
					};
					sgMail.send(msg);
				 	})
			  		res.send("account created! check your email for a verification link from chase@memesearch.net");	  
				});
	},
	confirmationForm: function(req, res) {
		const filePath = "./views/main/confirm.hbs";
			const resolvedPath = path.resolve(filePath);
			return res.render(resolvedPath, {token: req.params.token});
	},
	confirmationEmail: function(req, res) {
			const userEmailToConfirm = req.body.loginemail;
			console.log("confirming email for  ", userEmailToConfirm);
				const result = validationResult(req).formatWith(errorFormatter);
				if (!result.isEmpty()) {
					return console.log("validation error", result.array())
				}
				Token.findOne({token:req.body.token}, function(err, token) {
					if (!token) return res.status(400).send({type: 'not-verified', msg: "no token maybe resend it "});
					userModel.findOne({_id: token.userId, email: userEmailToConfirm}, function(err, user) {
						if (!user) return res.status(400).send({msg: "no user for this token"});
						if (user.isVerified) return res.status(400).redirect("/");
						user.isVerified = true;
						user.save(function(err) {
							if (err) {
								return res.status(500).send({msg: err.message})
								} 
								res.status(200).redirect("/login");
						})
					})
				})
		},	
	confirmationEmailResend: function(req, res) {
		console.log('confirmationEmailResend function')
	},
	deleteAccount: function(req, res) {
		const accountEmail = req.body.loginEmail;
		console.log("deleting account for ", accountEmail);
		//delete account
		userModel.findOne({email: accountEmail}).then(function(account) {
			console.log("removing user ", accountEmail);
			account.remove(err => {
				console.log("user deleted");
				return res.redirect('/logout');
			})
		})
	},
	unfavorite: function(req, res, next) {
		console.log('unfavorite endpt')
		const favUrl = req.query.favUrl;
	 	memeModel.findOneAndUpdate({imageUrl: favUrl}, { $inc:{favorited: -1}}, function(err, meme) {
	 		memeId = meme._id
	 		memeImageUploader = meme.imageUploader
	 		console.log("meme id is")
	 		console.log(memeId)
	 		userModel.update(
		{
			email: req.user.email
		},
		{
			$pull: {favs: {memeId: memeId}}

		}, function(err, result) {
			if (err) {
				console.log(err)
			} else {
					if (memeImageUploader == req.user.username)	 {
						console.log("clout not removed - image uploader is logged in");
						console.log("result is ", result);
					} else {	
						userModel.findOneAndUpdate({username: memeImageUploader}, {$inc: {clout: -1}}, function (err, user){
						console.log("removed clout from ", user);
					})
				}
				res.send({"u sleep hoe":"lmao"});
			}
		});
 	})
	},
	requestFriend: function(req, res) {
		console.log("requestFriend function")
		var requestingUser = req.user.username;
		var requestedUser = req.body.thisUser;

		console.log("requestFriend, req session is ", req.session);
		console.log(requestingUser, "Is requesting", requestedUser, "to be FRANS");

		if (!req.user.username) {
			return console.log("not logged in ")
		}

		userModel.findOne({username: requestedUser, "friendRequests.friendUsername": requestingUser}).exec(function(err, requestExists) {
				//check if the request already exists
				if (requestExists) {
					return console.log("this friend has already been requested")
				} else {
					//if not, grab the friend and build NewFriend with info,
					//then pass it to addFriendRequest function
					userModel.findOne({username: requestingUser}).exec(function(err, friendToAdd) {
							var thisFriend = new NewFriend({
							dateAdded: Date.now(),
							friendUsername: requestingUser,
							friendId: friendToAdd._id
						})
							addFriendRequest(thisFriend);
					})
				}

			})

		function addFriendRequest(thisFriend) {
			console.log("addFriend function, friend to add is ", thisFriend)

			userModel.findOneAndUpdate({username: requestedUser},
			{
				$addToSet: {friendRequests: thisFriend}
			}, function(err, updated) {
				if (err) return console.log(err);
				console.log("friend requested");
				res.send({"status": "Friend requested"})
			})
		}
	},
	getFriendRequests: function(req, res) {
		var thisUser = req.body.thisUser;

		console.log("getFriendRequests function for ", thisUser);
		userModel.aggregate([
			{
				$match: {username: thisUser}	
			},
			{	
				$unwind: "$friendRequests"
			},
			{
				$lookup: {
					from: "users",
					localField: "friendRequests.friendId",
					foreignField: "_id",
					as: "requestingFriend"
				}
			},
			{
				$project: {
				 	_id: 0,
				 	"requestingFriend.username": 1,
				 	"requestingFriend.avvy": 1,
				 	"requestingFriend.clout": 1,
				 	"requestingFriend.blurb": 1,
				 	friends: { $subtract: [{ $cond: { if: { $isArray: "$requestingFriend.friends" }, then: { $size: "$requestingFriend.friends" }, else: 0} }, 1]}
				}
			}
			]).exec(function(err, requests) {
				if (!requests) return console.log("no friend requests =)");
				console.log("sending requests to client ", requests);
				res.send(requests)
 			})
	},
	getFriends: function(req, res) {
		var thisUser = req.body.thisUser;
		console.log("get friends for ", thisUser);
		userModel.findOne({username: thisUser}).exec(function(err, user) {
		})
		userModel.aggregate([
			{
				$match: {username: thisUser}	
			},
			{	
				$unwind: "$friends"
			},
			{
				$lookup: {
					from: "users",
					localField: "friends.friendId",
					foreignField: "_id",
					as: "friend"
				}
			},
			{
				$project: {
				 	_id: 0,
				 	"friend.username": 1,
				 	"friend.avvy": 1,
				 	"friend.clout": 1,
				 	"friend.blurb": 1
				}
			}
			]).exec(function(err, friends) {
				if (!friends) return console.log("no friends =)");
				res.send(friends)
 			})
	}

}					
