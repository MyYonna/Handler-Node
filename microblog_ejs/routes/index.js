var express = require('express'),router = express.Router(),users = require("./users"),expressLayouts = require("express-ejs-layouts");
var session = require("express-session");
var redisStore = require('connect-redis')(session);
var flash = require("connect-flash");
var partials =require("express-partials");
//使用session的redis中间件
router.use(session({
	saveUninitializedSession:true,
	resave:false,
	store:new  redisStore({host:"127.0.0.1",port:6379,ttl:60*60*24*30}),
	secret: 'express is powerful'
}));

//router.use(expressLayouts);

router.use(flash());

router.use(partials());



router.use(function(req,res,next){
	res.locals.errors = req.flash("error");
	res.locals.infos = req.flash("success");
	res.locals.user = req.session.user;
	next();
});

router.get("/",users.index);
router.all("/user/:user",checkLogin);
router.get("/user/:user",users.user);
router.post("/post",users.post);

router.all("/reg",checkNotLogin);
router.get("/reg",users.reg);
router.post("/reg",users.doReg);

router.all("/login",checkNotLogin);
router.get("/login",users.login);
router.post("/login",users.doLogin);

router.all("/logout",checkLogin);
router.get("/logout",users.logout);

function checkNotLogin(req,res,next){
	if(req.session.user){
		req.flash("error","已登入");
		return res.redirect("/");
	}
	
	next();
}

function checkLogin(req,res,next){
	if(!req.session.user){
		req.flash("error","未登入");
		return res.redirect("/login");
	}
	
	next();
}
exports.router = router;
