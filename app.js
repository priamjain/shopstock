const express = require("express"),
app = express(),
expressSession = require("express-session"),
mongoose = require("mongoose");
bodyParser = require("body-parser"),
User = require('./models/user'),
Business = require("./models/business"),
LocalStrategy = require("passport-local"),
searchable = require('mongoose-regex-search'),
passport = require("passport"),
Order = require("./models/orders"),
methodOverride = require("method-override");


//==============================================================================================================================
//Connect Mongo and USES
//==============================================================================================================================

app.use(methodOverride('_method'));

app.use(expressSession({
	secret : "YoLo",
	resave:false,
	saveUninitialized:false
}));

mongoose.connect('mongodb+srv://hello:v0sbEFcFwOjHoqpF@shops-trg7f.mongodb.net/shops?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true,useFindAndModify:false});
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


//====================================================================================================================
//GET ROUTES
//====================================================================================================================

app.get("/",(req,res)=>{
	res.locals.page="index";
	if(req.user) {
		User.findOne({_id:req.user.id}).populate({path: 'businesses',populate:{path:'orders',model:'Order'}}).exec((err,user)=>{
			res.render("index",{user:user});
		});
	} 
	else {
		res.render("index",{user:req.user});
	}
});

app.get("/business",(req,res)=>{
	res.locals.page="businesses";
	Business.search(req.query.q).populate('owner').exec((err,businesses)=>{
		res.render("businesses",{user:req.user,businesses:businesses});
	});
});

app.get("/business/new",isLoggedIn,(req,res)=>{
	res.locals.page = "newBusiness";
	res.render("newBusiness",{user:req.user});
});

app.get("/business/:businessId/order/new",isLoggedIn,(req,res)=>{
	res.locals.page = "newOrders";
	res.render("newOrder",{user:req.user,forBusiness:req.params.businessId});
});

app.get("/business/:businessId/edit",isLoggedIn,(req,res)=>{
	Business.findOne({_id:req.params.businessId},(err,business)=>{
		if(err){
			console.log(err);
			return res.redirect('/');
		}
		console.log(business);
		res.locals.page = "editBusiness";
		res.render("editBusiness",{user:req.user,business:business});
	})
});

app.get("/orders",isLoggedIn,function(req,res){
	res.locals.page = "orders";
	Order.find({byUser:req.user._id},(err,orders)=>{
		res.render('orders',{user:req.user,orders:orders});
	});
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

app.get("/logout",function(req,res){
	req.logout();
	res.redirect('/');

});

//===========================================================================================================================
//PUT ROUTES
//===========================================================================================================================

app.put("/business/:businessId/edit",isLoggedIn,(req,res)=>{
	req.body.days = JSON.parse(req.body.days);
	Business.findOneAndUpdate({_id:req.params.businessId},{$set: req.body},{new:true},(err,bus)=>{
		console.log(bus);
		res.redirect("/");
	})
});

//============================================================================================================================
//POST ROUTES
//============================================================================================================================


app.post('/business/:businessId/order',isLoggedIn,(req,res)=>{
	req.body.byUser = req.user._id;
	req.body.forBusiness=req.params.businessId;
	var order = new Order(req.body);
	User.findOneAndUpdate({_id:req.user._id},{$push:{"orders":order}},{new:true},(err,user)=>{
		if(err){
			return res.send("Error finding User");
		}
		Business.findOneAndUpdate({_id:req.body.forBusiness},{$push:{"orders":order}},(error,business)=>{
			if(error){
				return res.send("Error finding bussiness");
			};
		});
	});
	order.save();
	res.redirect("/orders");
});
app.post("/business",isLoggedIn,function(req,res){
	req.body.days = JSON.parse(req.body.days);
	req.body.owner = req.user._id;
	// console.log(req.body);
	var business = new Business(req.body);
	User.findOneAndUpdate({_id:req.user._id},{$push:{"businesses":business._id}},{new:true},(err,user)=>{
		business.save();
	});
	res.redirect("/business/new");
});
//

app.post("/register",function(req,res){

	User.register(new User({firstname:req.body.firstname,lastname:req.body.lastname,email:req.body.email}),req.body.password,function(err,user){

		if(err)
		{
			return res.redirect("/login?info=regerr");
		}

		passport.authenticate('local')(req, res,  ()=> {
			res.redirect('/');
		});
	});
});

app.post("/login",passport.authenticate("local",{successRedirect: '/',
	failureRedirect: '/login?info=logerr'}),function(err,user){
	console.log(err);
});


//=================================================================================================================
//LISTEN
//=================================================================================================================

// app.listen(3000,function(){
// 	console.log("Server Started");
// });

app.listen(process.env.PORT||8000,process.env.IP,function(){
	console.log("Server Started");
});


//=================================================================================================================
//Functions
//=================================================================================================================

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	return res.redirect("/login");
}
