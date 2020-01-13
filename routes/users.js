const express = require('express');
const router = express.Router();
const userController = require('../app/api/controllers/users');
const passport = require('passport');
const userSchemas = require('../app/api/models/users');
const UserModel = userSchemas.User;

//passport configuration
passport.serializeUser(function(user, done) {
	const sessionUser = {
		_id: user._id,
		username: user.username,
		email: user.email
	}
	done(null, sessionUser)
});

passport.deserializeUser((sessionUser, done) => {
		done(null, sessionUser);
});
const LocalStrategy = require("passport-local").Strategy;

passport.use(new LocalStrategy({
			usernameField: 'loginusername',
			passwordField: 'loginpassword'
		},
	(loginusername, loginpassword, done) => {
	UserModel.findOne({username: loginusername})
	.then(user => {
		if (!user || !user.validPassword(loginpassword)) {
			done(null, false, console.log("error with auth"));
		} else if (!user.isVerified) {
			done(null, false, console.log("user not verified"));
		}
		else {
			done(null, user)
		};
	})
	.catch(e => {
		console.log("error authenticating ", e);
		done(e)}
		)
}));
	//logged in middleware
	function loggedIn(req, res, next) {
		if (req.user) {
			next();
		} else {
			res.redirect('/login')
		}
	}
	router.post('/createacct', userController.validateCreate('create'), userController.create);
	router.get('/confirmation-form/:token', userController.confirmationForm);
	router.post('/confirmation', userController.validateCreate('confirmationEmail'), userController.confirmationEmail);
	router.post('/confirmationresend', userController.confirmationEmailResend)
	router.post('/authenticate',
		(req, res, next) => {
			next();
		},
		passport.authenticate("local", {
			successRedirect: "/",
			failureRedirect: "/login",
			failureFlash: false
		}));
	router.post('/deleteacct', loggedIn, userController.deleteAccount);
	router.get('/unfavorite', loggedIn, userController.unfavorite);
	router.post('/requestfriend', loggedIn, userController.requestFriend);
	router.post('/getfriendrequests', loggedIn, userController.getFriendRequests);
	router.post('/getfriends', userController.getFriends)

module.exports = router;

