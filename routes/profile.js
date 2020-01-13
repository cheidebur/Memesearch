const express = require('express');
const router = express.Router();
const profileController = require('../app/api/controllers/profile');
var jwt = require('jsonwebtoken');

function loggedIn(req, res, next) {
	if (req.user) {
		next();
	} else {
		res.redirect('/login')
	}
}
router.get('/profile', loggedIn, profileController.myProfile);
router.get('/editprofile', loggedIn, profileController.editProfile)
router.get('/users/:random', profileController.showProfile);
router.get('/users/:random/friends', profileController.myFriends)
router.get('/users/:random/friendrequests', loggedIn, profileController.friendRequests)
router.post('/acceptfriend', loggedIn, profileController.acceptFriend);
router.post('/denyfriend', loggedIn, profileController.denyFriend);
router.post('/deletefriend', loggedIn, profileController.deleteFriend);
router.post('/updateprofile', loggedIn, profileController.updateProfile);

module.exports = router;