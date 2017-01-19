var express = require("express"), bodyParser = require('body-parser'),
methodOverride = require("method-override"),expressLayouts = require("express-ejs-layouts"),
session = require("express-session"),cookieParser = require("cookie-parser"),router = require("./routes");


var app =  express();
var redisStore = require('connect-redis')(session);
app.set("views",__dirname+"/views");
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(router.router);
app.use(express.static(__dirname+"/public"));
app.use(cookieParser);

var server  = app.listen(3000,function(){
	var host = server.address().address;
	  var port = server.address().port;
	  console.log('Example app listening at http://%s:%s', host, port);
});
console.log("服务器启动成功....");
