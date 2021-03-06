/**
 * http://usejsdoc.org/
 */
function divEscapedContentElement(message){
	return $("<div></div>").text(message);
}

function divSystemContentElement(message){
	return $("<div></div>").html("<li>"+message+"</li>");
}

function processUserInput(chatApp,socket){
	var message = $("#send-message").val();
	var systemMessage;
	if(message.charAt(0) == "/"){
		systemMessage = chatApp.processCommand(message);
	}else{
		chatApp.sendMessage($("#room").text(),message);
		
		$("#messages").append(divEscapedContentElement(message));
		$("messages").scrollTop($("#message").prop("scrollHeight"));
	}
	$("#send-message").val("");
}