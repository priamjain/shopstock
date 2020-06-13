var express = require("express"),
app = express(),
expressSession = require("express-session"),
mongoose = require("mongoose");
bodyParser = require("body-parser"),
User = require('./models/user'),
Business = require("./models/business"),
LocalStrategy = require("passport-local"),
searchable = require('mongoose-regex-search'),
passport = require("passport");


app.use(expressSession({
	secret : "YoLo",
	resave:false,
	saveUninitialized:false
}));


//==========================
//Connect Mongo and USES
//==========================

mongoose.connect('mongodb+srv://hello:v0sbEFcFwOjHoqpF@shops-trg7f.mongodb.net/shops?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
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
app.use(bodyParser.json());
passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//=====================
//ROUTES
//=====================

app.get("/",function(req,res){
	res.locals.page="index";
	res.render("index",{user:req.user});

});

app.get("/business",function(req,res){
	res.locals.page="business";
	Business.search(req.query.q).populate('owner').exec(function(err,business){
		res.render("business",{user:req.user,business:business});
	});
});

app.post("/business",isLoggedIn,function(req,res){
	req.body.days = JSON.parse(req.body.days);
	req.body.owner = req.user._id;
	// console.log(req.body);
	var business = new Business(req.body);
	business.save();
	res.redirect("/business/new");
});
//
app.get("/business/new",isLoggedIn,function(req,res){
	res.locals.page = "newBusiness";
	res.render("newBusiness",{user:req.user});
});

app.get("/login",function(req,res,next){
	res.locals.page = "loginPage";
	if(req.isAuthenticated()){
		return res.redirect("/");
	}
	else{
		return next();
	};
	},function(req,res){
	res.render("loginPage",{user:req.user,info:req.query.info});
});

app.post("/register",function(req,res){

	User.register(new User({firstname:req.body.firstname,lastname:req.body.lastname,email:req.body.email}),req.body.password,function(err,user){

		if(err)
		{
			return res.redirect("/login?info=regerr");
		}

        passport.authenticate('local')(req, res, function () {
          res.redirect('/');
        });
	});
});

app.post("/login",passport.authenticate("local",{successRedirect: '/',
                                   failureRedirect: '/login?info=logerr'}),function(err,user){
	console.log(err);
});

app.get("/logout",function(req,res){
	req.logout();
    res.redirect('/');

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
