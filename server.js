const express = require("express");
const bodyparser = require("body-parser")
const mongoose = require("mongoose");
const session = require("express-session");
const app = express();
const exphbs = require("express-handlebars");
const userSchemas = require("./app/api/models/users");
const NewFav = userSchemas.MemeFav;
const cors = require("cors");
const hostName = require("./routes/host").host;

app.use(cors());

//express session setup
app.use(session({
    secret: process.env.ISSASECRET,
    resave: true,
    saveUninitialized: true
}));

mongoose.connect(process.env.MONGODB, (err, database) => {
	if(err) {
		return console.log(err);
	}
	console.log("connected to database successfully with mongoose");
	db = database;
})

//view engine
app.set('view engine', '.hbs');
app.engine('.hbs', exphbs ({
	defaultLayout:'default',
	layoutsDir:'views/layouts/',
	extname:'.hbs'
}))

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(express.static('public')); 
app.use(express.static('uploads'));

const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());

//routes and a controller
const memeController = require('./app/api/controllers/memes')
const profile = require('./routes/profile');
const users = require('./routes/users');
const memes = require('./routes/memes');

app.use('/', memes);
app.use('/', users);
app.get('/', (req, res) => {
	if (req.isAuthenticated) {
		console.log("user is authenticated.");
		console.log("user is ", req.user);
		res.render('main/index.hbs', {
			session: req.user,
			hostName: hostName
		});
		return;
	} else {
		console.log("user is NOT authenticated.");
		res.render('main/index.hbs', {
			hostName: hostName
		});
	}
});

app.use('/upload', memes);

app.use('/', profile);

app.use('/createacct', (req, res) =>{
 res.render('main/register.hbs', {
	 hostName: hostName
 })
});

app.use('/login', (req, res) => {
	res.render('main/login.hbs', {
		hostName: hostName
	})
	return;
})

app.use('/uploadpage', (req, res) => {
	res.render('main/uploadpage.hbs', {session: req.user, hostName: hostName});
	return;
})

app.use('/logout', (req, res) => {
	req.logout();
	return res.redirect("/");
});

//get a list of meme documents
app.get("/memeresults", (req, res) => {
	var memesCollection = db.collection("memes");
		memesCollectioncollection.find().toArray(function(err, docs) {
			console.log(docs)
			return res.json(docs);
		})
});

//add fav
app.post('/favorite', function(req, res) {
	if (!req.user) return res.send({loggedIn: false});
	const favUrl = req.body.favUrl;
	var memecollection = db.collection("memes");
	console.log("favoriting this meme Url ", favUrl);
	var usrcollection = db.collection("users");
	console.log("favorite endpoint from ", req.user.email);
	if (req.isAuthenticated()) {
		memecollection = db.collection("memes");
		memecollection.findOne({ imageUrl: favUrl }, function(err, thisMeme) {
			if (err) {
				console.log("error finding meme url or error w Something")
				console.log(err)
			} else {					
					//check if meme is already favorited, if so don't add clout
					usrcollection.findOne({email: req.user.email, "favs.memeId": thisMeme._id}, function(err, user) {
						if (user)  {
							return console.log("this meme is ALREADY FAVORITED!!")
						} else {
							memecollection.update({imageUrl: favUrl}, {$inc: {favorited: 1}}, function(err, result){
								if (err) console.log(err);
								console.log("favorited incremented ")
								const newFav = new NewFav({
									memeId: thisMeme._id,
									dateAdded: Date.now()
									});
									console.log("new fav is ", newFav);
										usrcollection.update(
										{
											email: req.user.email
										},
										{
											$addToSet: {favs: newFav}
										});
										res.end();
								if (req.user.username == thisMeme.imageUploader) {
									console.log("you can't give yourself clout")
								} else {
									usrcollection.findOneAndUpdate({username: thisMeme.imageUploader}, {$inc:{clout: 1}}, function(err, result){
										console.log("clout added");
										res.end();
									})
								}
							})
						}
					})
					
				}
			})
		}
	else {
		console.log('cant save fav cos not logged in babe')
		const data = {noAcct: true, shit: "FUUUVKKK LOL"}
		res.send( data)
		}
	});




// handle errors
app.use("/", function(req, res, next) {
	
  
  	res.status(404).render('main/404.hbs', {hostName: hostName});

});


app.listen(process.env.PORT || 8080);

