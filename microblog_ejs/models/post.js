/**
 * http://usejsdoc.org/
 */
var mysqlClient = require("../common/mysqlClient"),uuid = require("node-uuid"),redisClient = require("../common/redisClient");
function Post(user,post,time){
	this.user = user;
	this.post = post;
	if(time){
		this.time = time;
	}else{
		this.time = new Date();
	}
}

module.exports = Post;
var maxCount = 100;
Post.get = function(user,callBack){
	mysqlClient.query("select p.id as id ,p.post as post,p.user_id as user_id,u.user_name as user_name from post p left join user u on p.user_id = u.id  where p.user_id = ? ",user.id,function(err,result){
		if(err){
			return callBack(err,false);
		}
		console.log("查询返回的结果"+JSON.stringify(result));
		return callBack(false,result);
	});
};
Post.getLast = function(callBack){
	mysqlClient.query("select p.id as id ,p.post as post,p.user_id as user_id,u.user_name as user_name from post p left join user u on p.user_id = u.id limit  9",{},function(err,result){
		if(err){
			return callBack(err,false);
		}
		return callBack(false,result);
	});
};
Post.prototype.save = function(callBack){
	var post_insert = {
			id : uuid.v1().replace(new RegExp(/(-)/g),""),
			post : this.post,
			user_id:this.user.id,
			create_time:this.time
	};
	mysqlClient.query("insert into post set ?",post_insert,function(err,result){
		if(err){
			return callBack(err);
		}else{
			return callBack(null);
		}
	});
}