const express = require('express');
const router = express.Router();
const memeController = require('../app/api/controllers/memes')

function loggedIn(req, res, next) {
	if (req.user) {
		next();
	} else {
		res.redirect('/login')
	}
}

router.post('/', loggedIn, memeController.createMeme);
router.post('/edittags', loggedIn, memeController.editTags);
router.post('/deletememe', loggedIn, memeController.deleteMeme);
router.get('/memes/:random', memeController.serveMeme);
router.get('/find', memeController.find);
router.post('/myfind', memeController.myFind);
router.post('/getprofilememes', memeController.showProfileMemes);
router.get('/landingscroll', memeController.landingContent);
router.post('/postcomment', loggedIn, memeController.postComment);
router.post('/getcomments', memeController.getComments);
router.post('/deletecomment', loggedIn, memeController.deleteComment);
router.post('/scrollprofilememes', memeController.scrollProfileMemes);

module.exports = router;
