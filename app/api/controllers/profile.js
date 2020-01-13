var path = require('path');
const userSchemas = require('../models/users')
var userModel = userSchemas.User
var memeModel = require('../models/memes')
var NewFriend = userSchemas.Friend;
const hostName = require("../../../routes/host").host;

module.exports = {
	myProfile: function(req, res, next) {
		console.log("profile controller reached");
		const filePath = "./views/main/profile.hbs";
		const resolvedPath = path.resolve(filePath);
		console.log("req.body in myProfiel function is", req.body)
		userModel.findById( req.user._id, function(err, info) {
		if (info) {
			const friendsCount = info.friends.length;
			var friendRequests = false;		
			if (info.friendRequests.length > 0) {
				friendRequests = true;
			} 
			console.log("friend request variable is ", friendRequests);
			console.log(" myprofile user has ", friendsCount, " frans");
			memeModel.find({_id: {$in: info.favs}}, function(err, memeFind){
				res.render(resolvedPath, {
					info: info,
					session:req.user,
					favMemes: memeFind,
					friends: friendsCount,
					friendRequests: friendRequests,
					hostName: hostName
				});
			})
			return;
		} else {
			console.log("find error")
			res.end()
		  	}
		})
	},
	myFriends: function(req, res) {

			console.log("my friends");
			const userToFind = req.params.random;
			var thisUser;
			if (!req.user) {
				thisUser = false;
			} else {
				thisUser = req.user.username;
			}
			userModel.findOne({username: userToFind}).exec(function(err, user) {
				var isMe = false;
					if (thisUser == userToFind) {
						isMe = true;
						console.log("isMe ", isMe);
					}
				const friendsCount = user.friends.length;
				console.log("rendering friends page for ", user.username);
				res.render('main/friends.hbs', {
					info: user,
					friends: friendsCount,
					session: req.user,
					isMe: isMe,
					hostName: hostName
				})
			})		
	},
	friendRequests: function(req, res) {
				userToFind = req.params.random;
				userModel.findOne({username: userToFind}).exec(function(err, user) {
						res.render('main/friendrequests.hbs', {
						info: user,
						session: req.user,
						hostName: hostName
					})
				})
			},
	acceptFriend: function(req, res) {
				var friendToAccept = req.body.thatUser;
				var thisUser = req.body.thisUser;
				console.log("acceptFriend, accepting ", friendToAccept)
				userModel.findOne({username: thisUser}).exec(function(err, user) {
					//create me object for friend
					const dataForFriend = new NewFriend({
					 	dateAdded: Date.now(),
					 	friendUsername: thisUser,
					 	friendId: user._id
					})
					//save my object in friend's business
					userModel.findOne({username: friendToAccept}, function(err, Usr) {
						Usr.friends.push(dataForFriend);
						Usr.save(err => {
							if (err) res.status(500);
						})
					})
				})
				userModel.findOne({username: friendToAccept}).exec(function(err, user) {
					 //create friend object
					 const friendToAdd = new NewFriend({
						dateAdded: Date.now(),
						friendUsername: friendToAccept,
						friendId: user._id
					})
					 //save friend object 
					 userModel.findOne({username: thisUser}, function(err, Usr) {
					 	Usr.friends.push(friendToAdd);
					 	Usr.save( function(err) {
					 		if (err) return console.log(err);
					 		console.log("saved")
					 	})
					 }).then(saved => {
					 	if (saved) console.log("saveddt");
					 }).catch(err => 
					 {
					 	if (err) res.status(500).json({error: err});
					 })

					 //remove both request
					 userModel.findOneAndUpdate({username: thisUser},
					 	{$pull: {"friendRequests": {friendId: friendToAdd.friendId}}
					 }).then(pulled => {
					 	console.log("request pulled");
					 	if (!pulled) return console.log("empty");
					 	userModel.findOneAndUpdate({username:friendToAdd},
					 		{$pull: {"friendRequests": {friendId: pulled._id} } })
					 	}).catch(err => {
					 	if (err){
						 	res.status(500);
						 	console.log(err);
						 }
					 })
					// end to signal ajax success
					res.end();
				})
			
			},
			denyFriend: function(req, res) {
				var friendToDeny = req.body.thatUser;
				var thisUser = req.body.thisUser;
				console.log("denyFriend, denying ", friendToDeny);
				userModel.findOneAndUpdate({username: thisUser},
					{$pull: {friendRequests: {friendUsername: friendToDeny}}}).exec(function(err, user){
						console.log("user has been died from ", user)
						res.end();
				})
			},
			deleteFriend: function(req, res) {
				var userToDelete = req.body.thatUser;
				var userDeleting = req.body.thisUser;
				console.log("deleting ", userToDelete);
				userModel.findOneAndUpdate({username: userDeleting},
					{$pull: {friends: {friendUsername: userToDelete}}})
				.then(usr => {
					console.log("deleted friend from ", usr);
					return userModel.findOneAndUpdate({username: userToDelete},
						{ $pull: {friends: {friendUsername:userDeleting} } })
				})
				.catch(function(err) {
					res.status(500).json({error:err})
				})
				res.end();

			},
	showProfile: function(req, res) {
		console.log("showprofile session is ", req.user)
		console.log("showprofile")
		userToFind = req.params.random;
		var currentUser;
		if (req.user) {
			 currentUser = req.user.username;
		}
		console.log("current user is ", currentUser)
		if ((currentUser) && userToFind == currentUser) {
			console.log("this user is logged in- redirecting 2 profile")
			return res.redirect(hostName + '/profile')
		}
		//name the functions and write them separately
		//keep the functions shallow

		isFriendsCheck(userToFind);

		function isFriendsCheck (userToFind) {
			console.log("isFriendsCheck function");
			userModel.findOne({username: userToFind, "friends.friendUsername": currentUser}).then( function(user) {
				if (user) {
					console.log(currentUser, " is friends with ", userToFind);
					var weAreFriends = true;
					isRequestedCheck(weAreFriends, userToFind);
				} else {
					console.log(currentUser, " is not friends with ", userToFind);
					var weAreFriends = false;
					isRequestedCheck(weAreFriends, userToFind);
				};
			})
		}
		function isRequestedCheck (isMyFriend, userToFind) {
			userModel.findOne({username: userToFind, "friendRequests.friendUsername": currentUser}).then(function(user) {
				if (user) {
					console.log(currentUser, " has requested to be friends with ", userToFind);
					var friendshipRequestPending = true;
					displayProfile(friendshipRequestPending, isMyFriend)

				} else {
					console.log(currentUser, " has not requested to be friends with ", userToFind);
					var friendshipRequestPending = false;
					displayProfile(friendshipRequestPending, isMyFriend)
				}
			})
		}
		function displayProfile (friendRequested, isMyFriend) {
			console.log("displayProfile function called from isFriendsCheck, passed variable is ", isMyFriend);
				userModel.findOne({username: userToFind}).then( function(user) {
				if (!user) {
					console.log("nO USER BABE");
					res.render('main/404.hbs', {hostName: hostName});
				} else {
					var friendsCount = user.friends.length;
					//check friends list for username of session
					//if match, trigger const
					memeModel.find({_id: {$in: user.favs}}, function(err, memeFind){
						const isMyProfile = null;
						if ((req.user) && req.user.username == user.username) {
							isMyProfile = true;
						}
					res.render('main/showprofile.hbs', {
						info: user,
						session:req.user,
						favMemes: memeFind,
						isMyProfile: isMyProfile,
						friends: friendsCount,
						isMyFriend: isMyFriend,
						friendRequested: friendRequested,
						hostName: hostName		
						})
					})
				}
			})

		}
	},
	editProfile: function(req, res) {
		var thisUser = req.user.username;
		console.log("editing profile for ", thisUser);
		userModel.findOne({username: thisUser}).exec( function(err, user) {
			if (err) console.log(err);
			console.log("editing profile for ", user)
			res.render('main/editprofile', {
				info: user,
				session: req.user,
				hostName: hostName
			})
		})	
	},
	updateProfile: function(req, res) {
		console.log("update profile controller reached")
		console.log("update body is ", req.body)
		console.log("profile blurb is ", req.body.profileBlurb)
		console.log("avvyUrl is ", req.body.avvyUrl)
		//update avatar if theres a url
		if (req.body.avvyUrl != undefined) {
		avvyUrl = req.body.avvyUrl
		userModel.findOneAndUpdate({email: req.user.email}, {
			$set : {
				avvy: avvyUrl
			}
		}).then( function(req, res) {
			console.log("saved new blurb and avvy")
		})
	};
		//update blurb if theres a blurb
		console.log("updating blurb")
		if (req.body.profileBlurb != undefined) {
			console.log("new blurb is " + req.body.profileBlurb)
			userModel.findOneAndUpdate({email: req.user.email}, {
				$set : {
					blurb: req.body.profileBlurb
				}
			}).then( function(req, res) {
				console.log("saved new blurb, no avvy")
			})
		}
			res.redirect('/profile')
	}
}



