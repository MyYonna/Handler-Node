/**
 * http://usejsdoc.org/
 */
var socketio = require("socket.io");
var util = require("util");
var io,guestNumber = 1,nickNames={},nameUsed=[],currentRoom= {};
/**
 * 启动socket。io服务器，允许他搭载在已有的http服务器上
 */
exports.listen = function(server){
	
	io = socketio(server);
	io.set("log level" ,1 );
	io.on("connection",function(socket){
		//定义每一个用户连接的处理逻辑
		
		//为每个连接上来的拥护赋予一个访客命
		guestNumber = assignGuestName(socket);
		//把他放入聊天室Lobby中
		joinRoom(socket,"Lobby");
		//处理用户的消息，更名、创建聊天室及其变更
		handlerMessageBroadcasting(socket);
		
		handlerNameChangeAttempts(socket);
		
		handleRoomJoining(socket);
		//提供已经被占用的聊天室的列表
		socket.on("rooms",function(){
			socket.emit("rooms",io.sockets.adapter.rooms);
		});
		//处理用户断开连接后的清除逻辑
		handleClientDisconnection(socket);
	});
}
/**
 * 分配名称
 * @param socket
 * @returns
 */
function assignGuestName(socket){
	var name = "Guest" + guestNumber;
	nickNames[socket.id] = name;
	socket.emit("nameResult",{success:true,name:name});
	nameUsed.push(name);
	console.log("分配名称成功...")
	return guestNumber + 1;
}

function joinRoom(socket,room){
	socket.join(room);//用户加入房间
	currentRoom[socket.id] = room;//记录用户所在的当前房间
	socket.emit("joinResult",{room:room});//让用户知道他们已经进入新的房间
	//让房间里的其他人知道有新人进入房间
	socket.to(room).emit("message",{text:nickNames[socket.id]+" has joined "+room + "."});
	//获取在房间里的所有用户
	console.log(io.sockets.adapter.rooms);
	var socketsInRoom = io.sockets.adapter.rooms[room];
	if(socketsInRoom.length > 1){
		var usersInRoomSummary = "Users currently in " +room +";";
		var usersInRoom = socketsInRoom.sockets;
		console.log(usersInRoom);
		for(var userSocketId in usersInRoom){
			console.log(userSocketId);
			if(userSocketId != socket.id){
				if(userSocketId > 0){
					usersInRoomSummary += ",";
				}
				usersInRoomSummary += nickNames[userSocketId];
			}
		}
		usersInRoomSummary += ".";
		//讲房间里其他用户的汇总发给这个用户
		socket.emit("message",{text:usersInRoomSummary});
	}
	console.log("加入房间成功。。。");
}
/**
 * 改名
 * @param socket
 * @param nickName
 * @param namesUsed
 */
function handlerNameChangeAttempts(socket){
	socket.on("nameAttempt",function(name){
		if(name.indexOf("Guest") == 0){
			socket.emit("nameResult",{
				success:false,
				message:"Names cannot begin width 'Guest'"
			});
		}else{
			if(namesUsed.indexOf(name) == -1){
				//获取对应的昵称，并修改对应关系,删除掉已经使用的昵称
				var previousName = nickNames[socket.id];
				var previousNameIndex = namesUsed.indexOf(previousName);
				nameUsed.push(name);
				nickNames[socket.id] = name;
				delete namesUsed[previousNameIndex];
				socket.emit("nameResult",{
					success:true,
					name:name
				})
			}else{
				socket.emit("nameResult",{
					success:false,
					message:"That name is already in use"
				});
			}
		}
		console.log("改名成功....")
	});
}
/**
 * 转发消息
 * @param socket
 */
function handlerMessageBroadcasting(socket){
	socket.on("message",function(message){
		socket.broadcast.to(message.room).emit("message",{
			text:nickNames[socket.id]+":"+message.text
		});
		console.log("消息转发成功....")
	});
}
/**
 * 创建房间
 * @param socket
 */
function handleRoomJoining(socket){
	socket.on("join",function(room){
		socket.leave(currentRoom[socket.id]);
		joinRoom(socket,room.newRoom);
		console.log("创建房间成功....")
	});
}

function handleClientDisconnection(socket){
	socket.on("disconnect",function(){
		var nameIndex = nameUsed.indexOf(nickNames[socket.id]);
		//给其他用户发送此用户退出房间的消息
		var room = currentRoom[socket.id];
		console.log("退出房间"+room);
		socket.broadcast.to(room).emit("message",{
			text:nickNames[socket.id]+"退出房间。。"
		});
		
		delete nameUsed[nameIndex];
		delete nickNames[socket.id];
		console.log("连接断开....");
	})
}