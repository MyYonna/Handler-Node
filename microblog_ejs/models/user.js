/**
 * http://usejsdoc.org/
 */
var redisClient = require("../common/redisClient");
var mysqlClient = require("../common/mysqlClient");
var util = require("util");

function User(user){
	this.id = user.id;
	this.user_name = user.user_name;
	this.password = user.password;
}

module.exports = User;

module.exports.checkUnique = function(username,callBack){
	redisClient.sismember("users",username,function(err,user){
		if(err){
			console.log("用户数据错误....");
			return callBack(true,false);
		}
		if(user > 0){
			console.log("用户数据已存在....");
			return callBack(false,true);
		}else{
			console.log("用户数据不存在....");
			return callBack(false,false);
		}
	});
};
module.exports.get = function(username,callBack){
	var user = {user_name:username};
	mysqlClient.query("select * from user where 1 = 1 and  ?",user,function(err,result){
		if(err){
			console.log("查询出错");
			return callBack(true,null);
		}
		if(result.length == 0){
			console.log("查询无数据。。");
			return callBack(false,null);
		}
		return callBack(false,result[0]);
	})
};
User.prototype.save = function(callBack){
	var user = {
			id:this.id,
			user_name:this.user_name,
			password:this.password
	};
	mysqlClient.query("insert into user set ?",user,function(err,result){
		if(err){
			callBack(err,null);
		}else{
			console.log("用户数据插入mysql成功....");
			redisClient.sadd("users",user.user_name,function(err,doc){
					if(err){
						console.log(err);
						mysqlClient.query("delete user where ?",{id:user.id},function(err,doc){
							if(err){
								console.log("用户删除失败..")
							}
							 callBack("用户数据保存失败");
						});
					}else{
						console.log("用户数据保存成功");
						 callBack();
					}

			});
		}
		
	})

};
