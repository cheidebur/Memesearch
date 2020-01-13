var memeModel = require('../models/memes');
const userSchemas = require('../models/users');
var userModel = userSchemas.User;
var NewFav = userSchemas.MemeFav;
var MemeComment = require('../models/comment')
var ObjectId = require('mongoose').Types.ObjectId;
const hostName = require("../../../routes/host").host;

module.exports = {
    createMeme: function(req, res) {
        console.log("session createMeme func", req.session)
        //return if no session username
        if (!req.user) return;
        console.log("createMeme request body is ")
        console.log(req.body);

        const fileUrl = req.body.fileUrl

        //populate meme constructor
        var myData = new memeModel(req.body);
        myData.imageUrl = fileUrl
        var newMemeId = req.body.imgId
		myData.memeId = newMemeId
		
        //populate favorite constructor
        userModel.findOne({
            username: req.user.username
        }).exec(function(err, user) {

            userId = user.id;
            myData.imageUploader = user.username;
            myData.author = userId;
            myData.save().then(saved => {
                console.log("posted! ;)");
                console.log(saved)
                //save the meme in user's favs
                //populate favorite constructor
                var thisFav = new NewFav({
                    memeId: saved._id,
                    dateAdded: Date.now()
                })
                user.favs.push(thisFav);
                user.save().then(usr => {
                    console.log("saved ", saved, "in ", usr)
                })
            })
        })
        res.redirect( hostName + 'profile');
    },
    editTags: function(req, res, next) {

        console.log('hi bich');
        newTags = req.body.editedtags
        console.log("memeId from form is")
        memeId = req.body.memeId
        memeModel.findOneAndUpdate({
            memeId: memeId
        }, {
            $set: {
                imageTags: newTags
            }
        }).then(function(err) {
            console.log("updated lol")
        })
        console.log(memeId)
        console.log(req.body.editedtags);
        res.redirect('/profile')

    },
    serveMeme: function(req, res) {
        randomV = req.params.random
        var isAuthor = null
        if (!res.headersSent) {
            memeModel.findOne({
                memeId: randomV
            }).populate("author").exec(function(err, meme) {
                if (err) {
                    console.log(err);
                    res.end()
                } else if (meme) {

                    if ((req.user) && meme.imageUploader == req.user.username) {
                        isAuthor = true;
                    }
                    res.render("main/meme.hbs", {
                        meme: meme,
                        session: req.user,
						authorCheck: isAuthor,
						hostName: hostName
                    })
                } else {
                    console.log("meme not found sis!")
                    res.render('main/404.hbs', {hostName: hostName})
                }
            })
        }
    },
    deleteMeme: function(req, res) {
        memeId = req.body.memeId;
        memeModel.findOneAndDelete({
            memeId: memeId
        }).then(function(err) {
            console.log("meme DELETEd");
        });
        res.redirect('/profile');
    },
    find: function(req, res) {
        const searchQuery = req.query.terms;
        console.log(req.query.page);
        memeModel.paginate({
            imageTags: {
                $regex: new RegExp(searchQuery)
            }
        }, {
            populate: "author",
            page: req.query.page,
            limit: 40

        }).then(function(docs) {
            console.log("queried docs are ")
            res.send(docs);
            res.end();
        })
        return;
    },
    showProfileMemes: function(req, res) {
        const thisUserProfile = req.body.thisUser;
        userModel.aggregate([{
                $match: {
                    username: thisUserProfile
                }
            },
            {
                $unwind: "$favs"
            },
            {
                $sort: {
                    "favs._id": -1
                }
            },
            {
                $limit: 40
            },
            {
                $lookup: {
                    from: "memes",
                    localField: "favs.memeId",
                    foreignField: "_id",
                    as: "profileMeme"
                }
            },
            {
                $unwind: "$profileMeme"
            },
            {
                $project: {
                    _id: 0,
                    "favs._id": 1,
                    "favs.memeId": 1,
                    profileMeme: 1

                }
            }
        ]).exec(function(err, profileMemes) {
            // console.log("profile memes are ", profileMemes);
            if (profileMemes.length == 0) {
                console.log("empty")
            }
            //client grabs 10th memeID for pagination
            res.send(profileMemes);
        })
    },
    scrollProfileMemes: function(req, res) {
        console.log("scrollProfileMemes");
        var lastMemeId = req.body.lastMeme;
        var thisUserProfile = req.body.thisUser
        //convert memeId from string to objectId to search
        lastMemeId = new ObjectId(lastMemeId);
        userModel.aggregate([{
                $match: {
                    username: thisUserProfile
                }
            },
            {
                $unwind: "$favs"
            },
            {
                $sort: {
                    "favs._id": -1
                }
            },

            {
                $match: {
                    "favs.memeId": {
                        $lt: lastMemeId
                    }
                }
            },

            {
                $limit: 10
            },
            {
                $lookup: {
                    from: "memes",
                    localField: "favs.memeId",
                    foreignField: "_id",
                    as: "profileMeme"
                }
            },
            {
                $unwind: "$profileMeme"
            },
            {
                $project: {
                    _id: 0,
                    profileMeme: 1,
                    "favs._id": 1

                }
            }
        ]).exec(function(err, nextMemes) {
            // console.log("profile memes are ", profileMemes);
            if (nextMemes == []) {
                console.log("empty")
            }
            console.log("memeScroll function memes are ", nextMemes);
            res.send(nextMemes);
        })
    },
    myFind: function(req, res) {

        const searchQuery = req.body.terms;
        thisUserProfile = req.body.thisUser

        userModel.findOne({
            username: thisUserProfile
        }).exec(function(err, user) {});
        userModel.aggregate([{
                $match: {
                    username: thisUserProfile
                }
            },
            {
                $lookup: {
                    from: "memes",
                    localField: "favs.memeId",
                    foreignField: "_id",
                    as: "favMemes"
                }
            },
            {
                $unwind: "$favMemes"
            },
            {
                $match: {
                    "favMemes.imageTags": {
                        $regex: new RegExp(searchQuery)
                    }
                }
            },
            {
                $sort: {
                    "favMemes.date": -1
                }
            },
            {
                $project: {
                    _id: 0,
                    favMemes: 1
                }
            }
        ]).exec(function(err, things) {
            if (!things) return console.log("no thang");
            if (things.length == 0) {
                console.log("empty search data")
            }
            res.send(things);
        });
    },
    landingContent: function(req, res) {
        console.log("landingContent page " + req.query.page)
        memeModel.paginate({}, {
            sort: {
                date: -1
            },
            page: req.query.page,
            populate: 'author',
            limit: 40
        }).then(docs => {
            res.send(docs)
        })
    },
    getComments: function(req, res) {
        memeId = req.body.memeId
        memeModel.aggregate([{
                $match: {
                    memeId: memeId
                }
            },
            {
                $unwind: "$comments"
            },
            {
                $sort: {
                    "comments.datePosted": -1
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "comments.authorName",
                    foreignField: "username",
                    as: "authorUserInfo"
                }
            },
            {
                $unwind: "$authorUserInfo"
            },
            {
                $project: {
                    _id: 0,
                    comments: 1,
                    authorUserInfo: {
                        avvy: 1,
                        username: 1,
                        clout: 1
                    }
                }
            }
        ]).exec(function(err, comments) {
            res.send(comments)
            res.end()
        })
    },
    deleteComment: function(req, res) {
        const commentId = new ObjectId(req.body.cmtId);
        memeModel.updateOne({
            "comments._id": commentId
        }, {
            $pull: {
                comments: {
                    _id: commentId
                }
            }
        }).then(function(meme) {
            res.end();
        })
    },
    postComment: function(req, res) {
        if (!req.user) {
            return res.redirect( hostName + '/login')
        }

        const commentText = req.body.commenttext
        const memeId = req.body.memeId
        const author = req.user.username
        userModel.findOne({
            username: author
        }).exec(function(err, user) {
            commentObject = {
                "comment": commentText,
                "authorName": user.username,
                "author": user._id,
                "datePosted": Date.now()
            }
            var commentToPost = new MemeComment(commentObject)
            if (err) {
                res.end();
            } else {
                memeModel.updateOne({
                    memeId: memeId
                }, {
                    $push: {
                        comments: commentToPost
                    }
                }).populate('comments.author').exec(function(err, memeComment) {
                    res.redirect('back');
                })

            }
        })
    }
}