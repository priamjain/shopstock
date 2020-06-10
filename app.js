var express = require("express"),
app = express(),
expressSession = require("express-session"),
mongoose = require("mongoose");
bodyParser = require("body-parser"),
User = require('./models/user'),
LocalStrategy = require("passport-local"),
passport = require("passport");


app.use(expressSession({
	secret : "YoLo",
	resave:false,
	saveUninitialized:false
}));


//==========================
//Connect Mongo and USES
//==========================

mongoose.connect('mongodb://localhost/shops', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("MongoDB connected");
});

app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//=============
//ROUTES
//=============

app.get("/",function(req,res){
	res.render("index");

});

app.get("/login",function(req,res){
	res.render("loginPage");
});

app.post("/register",function(req,res){
	console.log("rec");
	User.register(new User({username:req.body.username,email:req.body.email}),req.body.password,function(err,user){
		if(err)
		{
			console.log(err);
			return res.redirect("/login");
		}
		passport.authenticate('local', { successRedirect: '/',
			failureRedirect: '/login',
			failureFlash: true })
	});
});


app.listen(3000,function(){
	console.log("Server Started");
});