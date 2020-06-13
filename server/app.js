var express = require("express"),
app = express(),
expressSession = require("express-session"),
mongoose = require("mongoose");
bodyParser = require("body-parser"),
User = require('./models/user'),
UserSession = require('./models/userSession'),
Business = require("./models/business"),
LocalStrategy = require("passport-local"),
searchable = require('mongoose-regex-search'),
passport = require("passport"),
bcrypt = require('bcrypt');

// app.use(expressSession({
// 	secret : "YoLo",
// 	resave:false,
// 	saveUninitialized:false
// }));


//==========================
//Connect Mongo and USES
//==========================

mongoose.connect('mongodb+srv://ak:bhatia@cluster0-mfptq.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("MongoDB connected");
});

app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(passport.initialize());
// app.use(passport.session());
app.use(bodyParser.json());
// passport.use(User.createStrategy())
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());


//=====================
//ROUTES
//=====================

app.get("/",function(req,res){
	res.locals.page="index";
	res.render("index",{user:req.user});

});

 app.get("/business", (req,res)=>{
	Business.find({}).then(data=>{
		res.send(data)
	}).catch(err=>{
		console.log(err)
	})
});

 app.get("/userssss", (req,res)=>{
	User.find({}).then(data=>{
		res.send(data)
	}).catch(err=>{
		console.log(err)
	})
});

 app.get("/userss", (req,res)=>{
	UserSession.find({}).then(data=>{
		res.send(data)
	}).catch(err=>{
		console.log(err)
	})
});

app.post("/business",function(req,res){
	req.body.days = JSON.parse(req.body.days);
	req.body.owner = req.user._id;
	// console.log(req.body);
	var business = new Business(req.body);
	business.save();
	res.redirect("/business/new");
});
//
app.get("/business/new",function(req,res){
	res.locals.page = "newBusiness";
	res.render("newBusiness",{user:req.user});
});

// app.get("/login",function(req,res,next){
// 	res.locals.page = "loginPage";
// 	if(req.isAuthenticated()){
// 		return res.redirect("/");
// 	}

// 	else{
// 		return next();
// 	};
// 	},function(req,res){
// 	res.render("loginPage",{user:req.user,info:req.query.info});
// });

app.post("/register", (req,res, next) => {

	var user = req.body;
	user.email = user.email.toLowerCase();
	User.find({
		email : user.email
	}, (err,prevUser) => {
		if(err){
			return res.send({
			success: false,
			message: 'Error'
			});
		} else if(prevUser.length>0){
			return res.send({
				success: false,
				message: "User exists"
			});
		}
		const newUser = new User(user);
		newUser.password = newUser.generateHash(newUser.password);
		newUser.save((err, user) => {
			if(err){
				console.log("Cant create");
			} else {
				res.send({
					success: true,
					message: "Welcome "+user.firstname
				});
			}
		})
	});
});

app.post("/login", (req, res, next) => {
	var userCred = req.body;
	userCred.email = userCred.email.toLowerCase();
	console.log("userCred"+userCred)
	User.find({
		email : userCred.email
	}, (err, users) => {
		if(err){
			return res.send({
				success: false,
				message: 'Error'
			});
		}
		if(users.length!=1){
			return res.send({
				message: "User does not exists"
			});
		}
		const user = users[0];
		if(!user.validPassword(userCred.password)){
			return res.send({
				success: false,
				message: 'Invalid Password'
			});
		}
		console.log("user"+ user)
		const userSession = new UserSession();
		userSession.userId = user._id;
		userSession.save((err, doc)=>{
			if(err){
				return res.send({
					success: false,
					message: 'Invalid Password'
				});
			}

			return res.send({
				success: true,
				message: 'Signed In',
				token: doc._id
			})
		});
	});
});

app.get("/verify", (req,res) => {
	const {query} = req;
	const {token} = query;
	console.log(token);
	UserSession.find({
		_id: token,
		isDeleted: false
	}, (err, sessions) => {
		if(err){
			return res.send({
				success: false,
				message: 'Error: Server Error'
			});
		}
		if(sessions.length != 1){
			return res.send({
				success: false,
				message: 'Error: Another Error'
			})
		}
		else{
			return res.send({
				success: true,
				message: 'Good'
			})
		}
	})
});

app.get("/logout", (req,res) => {
	const {query} = req;
	const {token} = query;
	console.log(token);
	UserSession.findOneAndUpdate({
		_id: token,
		isDeleted: false
	}, {
		$set: {isDeleted: true}
	}, null, (err, sessions) => {
		if(err){
			return res.send({
				success: false,
				message: 'Error: Server Error'
			});
		}
		return res.send({
			success: true,
			message: 'Good'
		})
	})
});


// app.listen(3000,function(){
// 	console.log("Server Started");
// });

app.listen(process.env.PORT||8000,process.env.IP,function(){
	console.log("Server Started");
});

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	return res.redirect("/login");
}
