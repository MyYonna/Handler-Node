var express = require('express'),crypto = require('crypto'),User = require("../models/user")
,uuid = require("node-uuid"),Post = require("../models/post");

/* GET home page. */
exports.index = function(req,res){
	console.log("用户首页.....");
		Post.getLast(function(err,posts){
			if(err){
				req.flash("error",err);
			}
			res.render("index",{
				title:"首页",
				posts:posts
			});
		})
}
exports.user = function(req,res){
	console.log("获取用户信息.....");
	User.checkUnique(req.params.user,function(err,user){
		if(err){
			req.flash('error','查询发生错误');
			return res.redirect('/reg');
		}
		if(!user){
			req.flash('error','用户不存在');
			return res.redirect("/");
		}
		Post.get(req.session.user,function(err,posts){
			if(err){
				req.flash("error",err);
				return res.redirect("/");
			}
			return res.render("user",{
				title:req.params.user,
				posts:posts
			});
		})
		
	});
}
exports.post = function(req,res){
	var post = req.body["post"];
	var post_insert = new Post(req.session.user,post);
	post_insert.save(function(err){
		if(err){
			req.flash("error",err);
		}
		return res.redirect("/user/"+req.session.user.user_name);
	})
	console.log("更新用户信息.....");
}
exports.reg = function(req,res){
	console.log("进入注册用户页面.....");
	res.render("reg",{
		title:"注册"
	});
}
exports.doReg = function(req,res){
	if(req.body['password-repeat'] != req.body['password']){
		req.flash('error','两次输入的口令不一致');
		return res.redirect('/reg');
	}
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');
	
	var newUser = new User({
		id:uuid.v1().replace(new RegExp(/(-)/g),""),
		user_name:req.body.username,
		password:password
	});
	
	User.checkUnique(newUser.name,function(err,user){
		if(err){
			req.flash('error','查询发生错误');
			return res.redirect('/reg');
		}
		if(user){
			req.flash('error','用户名已存在');
			return res.redirect("/reg");
		}
		
		newUser.save(function(err){
			if(err){
				req.flash('error','保存发生错误');
				return res.redirect('/reg');
			}
			
			req.session.user = newUser;
			req.flash('success','注册成功');
			res.redirect("/");
		});
	});
	console.log("注册用户.....");
};
exports.login = function(req,res){
	console.log("登录页面.....");
	res.render("login",{
		title:"登入"
	});
};
exports.doLogin = function(req,res){
	console.log("登录.....");
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest("base64");
	
	User.checkUnique(req.body.username,function(err,user){
		if(!user){
			req.flash("error","用户不存在");
			return res.redirect("/login");
		}else{
			User.get(req.body.username,function(err,user){
				if(err){
					req.flash("error","查询出错");
					return res.redirect("/login");
				}
				
				if(!user){
					req.flash("error","用户不存在");
					return res.redirect("/login");
				}
				req.session.user = user;
				req.flash("success","登入成功");
				console.log("登入成功")
				res.redirect("/user/"+user.user_name)
			});
		}
		
		
	})
};
exports.logout = function(req,res){
	req.session.user = null;
	req.flash("success","登出成功");
	res.redirect("/");
	console.log("退出登录.....");
};
