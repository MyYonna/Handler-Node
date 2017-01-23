/**
 * http://usejsdoc.org/
 */
var Chat = function(socket){
	this.socket = socket;
}

Chat.prototype.sendMessage = function(room,text){
	var message = {
			room:room,
			text:text
	};
	this.socket.emit('message',message);
}

Chat.prototype.changeRoom = function(room){
	var message = {
			newRoom:room
	};
	this.socket.emit("message",message);
}

Chat.prototype.changeName = function(name){
	var message = {
			name:name
	};
	this.socket.emit("nameAttempt",message);	
}

Chat.prototype.processCommand = function(command){
	var words = command.split(" ");
	var command = words[0].substring(1,words[0].length).toLowerCase();
	var message = false;
	switch(command){
		case "join" : 
			var room  = words[1];
			this.changeRoom(room);
			break;
		case "nick" : 
			var name  = words[1];
			this.changeName(room);
			break;
			
		default : message = "未知的命令。。。";break;
	}
	return message;
}