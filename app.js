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

app.use((req,res,next)=>{
	res.locals.user = req.user;

	next();
})

//====================================================================================================================
//GET ROUTES
//====================================================================================================================

app.get("/",(req,res)=>{
	res.locals.page="index";
	if(req.user) {
		User.findOne({_id:req.user.id}).populate([{path: 'businesses', model:'Business',populate:[{path:'pendingOrders',model:'Order'},{path:'completedOrders',model:'Order'}]}]).exec((err,user)=>{
			if(err){
				console.log(err);
			}
			else{
				res.locals.user = user;
				res.render("index");}
		});
	} 
	else {
		res.render("index");
	}
});

app.get("/user/:userId/edit",isLoggedIn,(req,res)=>{
	res.locals.page='user';
	res.render('user');	
});

app.get("/user/:userId/deletedBusinesses",isLoggedIn,(req,res)=>{
	res.locals.page='deletedBusinesses';
	User.findById(req.user.id,'businesses').populate('businesses').exec((err,user)=>{
		res.locals.user = user;
		res.render('deletedBusinesses');
	});
});

app.get("/business",(req,res)=>{
	res.locals.page="businesses";
	Business.search(req.query.q).populate('owner').exec((err,businesses)=>{
		res.render("businesses",{businesses:businesses});
	});
});

app.get("/business/new",isLoggedIn,(req,res)=>{
	res.locals.page = "newBusiness";
	res.render("newBusiness");
});

app.get("/business/:businessId/order/new",isLoggedIn,(req,res)=>{
	res.locals.page = "newOrders";
	res.render("newOrder",{forBusiness:req.params.businessId});
});

app.get("/business/:businessId/edit",isLoggedIn,isAuthorizedForBus,(req,res)=>{
	Business.findOne({_id:req.params.businessId},(err,business)=>{
		if(err){
			console.log(err);
			return res.redirect('/');
		}
		console.log(business);
		res.locals.page = "editBusiness";
		res.render("editBusiness",{business:business});
	})
});

app.get("/orders",isLoggedIn,(req,res)=>{
	res.locals.page = "orders";
	Order.find({byUser:req.user._id},(err,orders)=>{
		res.render('orders',{orders:orders});
	});
});

app.get("/order/:orderId",isLoggedIn,isAuthorizedForOrderFor,(req,res)=>{
	res.locals.page = "order"
	Order.findOne({_id:req.params.orderId},(err,order)=>{
		if(err){
			console.log(err);
			return res.send(err);
		}
		// console.log(order);
		res.render("order",{order:order});
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
	res.render("loginPage",{info:req.query.info});
});

app.get("/logout",function(req,res){
	req.logout();
	res.redirect('/');

});

//===========================================================================================================================
//PUT ROUTES
//===========================================================================================================================

app.put("/business/:businessId/undodelete",isLoggedIn,isAuthorizedForBus,(req,res)=>{
	Business.findOneAndUpdate({_id:req.params.businessId},{deleted:false},{new:true},(err,business)=>{
		res.redirect("/");

	});
});

app.put("/user/:userId",isLoggedIn,(req,res)=>{
	var userdata = req.body;
	User.findByIdAndUpdate(req.params.userId,{firstname:userdata.firstname,lastname:userdata.lastname},{new:true,safe:true},(err,user)=>{
		if(err){
			return console.log(err);
		}
		console.log(userdata);
		return res.redirect("/");
	})
});

app.put("/business/:businessId",isLoggedIn,isAuthorizedForBus,(req,res)=>{
	req.body.days = JSON.parse(req.body.days);
	Business.findOneAndUpdate({_id:req.params.businessId},{$set: req.body},{new:true},(err,bus)=>{
		console.log(req.body);
		res.redirect("/");
	})
});

app.put("/order/:orderId/done",isLoggedIn,isAuthorizedForOrderFor,(req,res)=>{
	let done=false;
	if(req.body.done=='true'){
		done=true;
		Order.findOneAndUpdate({_id:req.params.orderId},{$set:{'done':done}},{new:true},(err,order)=>{
			if(err){
				console.log(err);
				return res.redirect("/");
			}

		//
		Business.findOneAndUpdate({_id:order.forBusiness},{$addToSet:{completedOrders:order},$pull:{'pendingOrders':order._id}},{new:true},(err,business)=>{
			console.log(order);
			console.log(business);
		});
	});
	}
	else{
		Order.findOneAndUpdate({_id:req.params.orderId},{$set:{'done':done}},{new:true},(err,order)=>{
			if(err){
				console.log(err);
				return res.redirect("/");
			}

		//
		Business.findOneAndUpdate({_id:order.forBusiness},{$pull:{completedOrders:order._id},$addToSet:{'pendingOrders':order}},{new:true},(err,business)=>{
			console.log(order);
			console.log(business);
		});
	});
	}


	return res.redirect("/");
});

//============================================================================================================================
//POST ROUTES
//============================================================================================================================


app.post('/business/:businessId/order',isLoggedIn,(req,res)=>{
	req.body.byUser = req.user._id;
	req.body.forBusiness=req.params.businessId;
	var order = new Order(req.body);
	User.findOneAndUpdate({_id:req.user._id},{$push:{"pendingOrders":order}},{new:true},(err,user)=>{
		if(err){
			return res.send("Error finding User");
		}
		Business.findOneAndUpdate({_id:req.body.forBusiness},{$push:{"pendingOrders":order}},(error,business)=>{
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
//DESTROY ROUTE
//=================================================================================================================

app.delete("/business/:businessId",isLoggedIn,isAuthorizedForBus,(req,res)=>{
	Business.findOneAndUpdate({_id:req.params.businessId},{deleted:true},{new:true},(err,business)=>{
		res.redirect("/");

	});
});


//=================================================================================================================
//LISTEN
//=================================================================================================================

// app.listen(3000,function(){
// 	console.log("Server Started");
// });

app.listen(process.env.PORT||3000,process.env.IP,function(){
	console.log("Server Started");
});


//=================================================================================================================
//MIDDLEWAREs
//=================================================================================================================

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	return res.redirect("/login");
}

function isAuthorizedForBus(req,res,next){
	Business.findById(req.params.businessId,(err,business)=>{
		if(business.owner.equals(req.user.id)){
			next();
		}else{
			res.send("not authorized");
		}
	});
	

};

function isAuthorizedForOrderFor(req,res,next){
	Order.findById(req.params.orderId,).populate('forBusiness').exec((err,order)=>{
		if(order.forBusiness.owner.equals(req.user.id)){
			next();
		}else{
			res.send("not authorized");
		}
	});
};
