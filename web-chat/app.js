/**
 * http://usejsdoc.org/
 */

var http = require("http");
var fs = require("fs");
var path = require("path");
var mime = require("mime");
var chatServer = require("./bin/chat_server");

var cache = {};
/**
 * 发送文件查找不到的错误
 * @param response
 */
function send404(response){
	response.writeHead(404,{"Content-Type":"text/plain"});
	response.write("Error 404:resource not found");
	response.end();
}
/**
 * 发送文件
 * @param response
 * @param filePath
 * @param fileContents
 */
function sendFile(response,filePath,fileContents){
	response.writeHead(200,{"Content-Type":mime.lookup(path.basename(filePath))});
	response.write(fileContents);
	response.end();
}

function serverStatic(response,cache,absPath){
	if(cache[absPath]){
		sendFile(response,absPath,cache[absPath]);
	}else{
		fs.exists(absPath,function(exists){
			if(exists){
				fs.readFile(absPath,function(err,data){
					if(err){
						send404(response);
					}else{
						cache[absPath] = data;
						sendFile(response,absPath,data);
					}
				});
			}else{
				send404(response);
			}
		});
	}
}

var server = http.createServer(function(request,response){
	var filePath = false;
	if(request.url == "/"){
		filePath = "public/index.html";
	}else{
		filePath = "public"+request.url;
	}
	var absPath = "./"+filePath;
	serverStatic(response,cache,absPath);
})
server.listen(3000,function(){
	console.log("Server listenning on port 3000.");
});


chatServer.listen(server);