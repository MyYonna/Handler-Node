/**
 * http://usejsdoc.org/
 */
var mysql = require("mysql");

var connection = mysql.createConnection({
	host:"127.0.0.1",
	port:3306,
	database:"handlerproperty",
	dataStrings:true,
	typeCast:true,
	user:"handler",
	password:"handler"
});

function handleDisconnect(){
	connection.connect(function(err){
		if(err){
			console.log("链接数据库发生错误");
			setTimeout(handleDisconnect,3000);
		}
		console.log("链接数据库成功");;
	});
	
	connection.on("error",function(err){
		console.log("db error",err);
		if(err.code = 'PROTOCOL_CONNECTION_LOST'){
			handleDisconnect();
		}else{
			throw err;
		}
	});
}

handleDisconnect();

module.exports = connection;