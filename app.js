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
	saveUninitialised:false
}));
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());



//Connect Mongo
mongoose.connect('mongodb://localhost/shops', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("MongoDB connected");
});

passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





//ROUTES
app.get("/",function(req,res){
	res.render("index");

});

app.get("/login",function(req,res){
	res.render("loginPage");
});


app.listen(3000,function(){
	console.log("Server Started");
});