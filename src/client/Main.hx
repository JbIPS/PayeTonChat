package client;

import js.browser.SocketIo;
import js.html.Audio;
import js.html.Element;
import js.JQuery;
import js.Lib;

using StringTools;

class Main
{
	var FADE_TIME = 150; // ms
	var TYPING_TIMER_LENGTH = 400; // ms
	var COLORS = [
		'#e21400', '#91580f', '#f8a700', '#f78b00',
		'#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
		'#3b88eb', '#3824aa', '#a700ff', '#d300e7'
	];

	var usernameInput: JQuery;
	var messages: JQuery;
	var inputMessage: JQuery;
	var loginPage: JQuery;
	var chatPage: JQuery;
	var participantList: JQuery;
	var smileyContainer: JQuery;

	var username: String;
	var connected = false;
	var typing = false;
	var lastTypingTime: Float;
	var currentInput: JQuery;

	var urlRegExp: EReg;
	var smileyRegExp: EReg;
	var whisperRegExp: EReg;

	var socket: Socket;

	public static function main(){
		new Main();
	}

	public function new()
	{
		usernameInput = new JQuery('.usernameInput');
		messages = new JQuery('.messages');
		inputMessage = new JQuery('.inputMessage');
		loginPage = new JQuery('.login.page');
		chatPage = new JQuery('.chat.page');
		participantList = new JQuery(".participants ul");
		smileyContainer = new JQuery(".smileyContainer");
		new JQuery(".smileyButton").click(function(e){
			smileyContainer.fadeIn();
		});


		currentInput = usernameInput.focus();
		socket = SocketIo.connect();

		urlRegExp = ~/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
		smileyRegExp = ~/(\]:\)|[:;][\S]+|8\)|:.+:|\S\.\S{1,2}|<3\)?)/g;
		whisperRegExp = ~/^@(.+?):/;

		// Keyboard events
		new JQuery(js.Browser.window).keydown(function (event) {
			// Auto-focus the current input when a key is typed
			if (!(event.ctrlKey || event.metaKey || event.altKey)) {
				currentInput.focus();
			}
			// When the client hits ENTER on their keyboard
			if (event.which == 13) {
				if (username != null) {
					sendMessage();
					socket.emit('stop typing');
					typing = false;
				} else {
					setUsername();
				}
			}
		});

		inputMessage.on('input', function(_) {
			if(Lib.self.value.charAt(0) != "@")
				updateTyping();
		});
		// Click events
		// Focus input when clicking anywhere on login page
		loginPage.click(function () {
			currentInput.focus();
		});
		// Focus input when clicking on the message input's border
		inputMessage.click(function () {
			inputMessage.focus();
		});
		// Socket events
		// Whenever the server emits 'login', log the login message
		socket.on('login', function (data) {
			//connected = true;
			// Display the welcome message
			var message = "Bienvenue sur PayeTonChat !";
			log(message, {
				prepend: true
			});
			var usernames: Array<String> = data.usernames;
			var history: Array<{username: String, message: String}> = data.history;
			for(u in usernames)
				addParticipantsMessage(u);
			for(h in history)
				addChatMessage(h);
		});
		// Whenever the server emits 'new message', update the chat body
		socket.on('new message', function (data) {
			var sound = new Audio();
			sound.src = "sounds/new_msg.mp3";

			addChatMessage(data);

			sound.play();
		});
		// Whenever the server emits 'user joined', log it in the chat body
		socket.on('user joined', function (data) {
			log(data.username + ' joined');
			var sound = new Audio();
			sound.src = "sounds/new_connection.mp3";
			addParticipantsMessage(data.username);
			sound.play();
		});
		// Whenever the server emits 'user left', log it in the chat body
		socket.on('user left', function (data) {
			log(data.username + ' left');
			var sound = new Audio();
			sound.src = "sounds/user_leaving.mp3";
			addParticipantsMessage(data.username, false);
			removeChatTyping(data);
			sound.play();
		});
		socket.on("new action", function(action: String){
			log(action);
		});
		// Whenever the server emits 'typing', show the typing message
		socket.on('typing', function (data) {
			addChatTyping(data);
		});
		// Whenever the server emits 'stop typing', kill the typing message
		socket.on('stop typing', function (data) {
			removeChatTyping(data);
		});
		socket.on("disconnect", function(data) {
			trace("Unable to reach the server");
			connected = false;
		});
		socket.on("connect", function(data){
			trace("Connection");
			if(username != null)
				socket.emit("socket reconnect", username, function(){
					connected = true;
				});
		});
	}

	function addParticipantsMessage(name: String, ?connection: Bool = true){
		if(connection){
			var li = new JQuery("<li/>");
			new JQuery("<a><span class='glyphicon glyphicon-user'></span>"+name+"</a>").click(function(e){
				if(Lib.self.textContent == username)
					inputMessage.val("\\u ");
				else
					inputMessage.val("@"+Lib.self.textContent+": ");
				inputMessage.focus();
			}).appendTo(li);
			participantList.append(li);
		}
		else
			participantList.children("li").each(function(){
				if(Lib.self.textContent == name)
					Lib.self.remove();
			});
	}

	// Sets the client's username
	function setUsername(){
		username = cleanInput(usernameInput.val().trim());

		// If the username is valid
		if (username != "") {
			loginPage.fadeOut();
			chatPage.show();
			loginPage.off('click');
			currentInput = inputMessage.focus();
			// Tell the server your username
			socket.emit('add user', username);
			connected = true;
		}
		else
			username = null;
	}

	// Sends a chat message
	function sendMessage () {
		var message = inputMessage.val();
		// Prevent markup from being injected into the message
		message = cleanInput(message);

		// if there is a non-empty message and a socket connection
		if (message != null && connected) {
			inputMessage.val('');
			var data: Dynamic = {
				username: username,
				message: message,
			};
			
			if(message.startsWith("\\u")){
				var msg = message.replace("\\u", username);
				socket.emit("new action", msg);
				log(msg);
			}
			else{
				if(whisperRegExp.match(message))
					data.whisperTarget = whisperRegExp.matched(1);
				addChatMessage(data);
				// tell server to execute 'new message' and send along one parameter
				socket.emit('new message', message);
			}
		}
	}

	// Log a message
	function log(message, ?options) {
		var el = new JQuery('<li>').addClass('log').text(message);
		addMessageElement(el, options);
	}

	// Adds the visual chat message to the message list
	function addChatMessage (data: Dynamic, ?options: Dynamic) {
		// Don't fade the message in if there is an 'X was typing'
		var typingMessages = getTypingMessages(data);
		if(options == null)
			options = {};

		if (typingMessages.length != 0) {
			options.fade = false;
			typingMessages.remove();
		}
		var usernameDiv = new JQuery('<span class="username"/>')
		.text(data.username)
		.css('color', getUsernameColor(data.username));
		// Found whisper
		if(whisperRegExp.match(data.message)){
			data.message = whisperRegExp.replace(data.message, "");
			if(Reflect.hasField(data, "whisperTarget") && data.whisperTarget != null)
				data.message = data.whisperTarget+" > "+data.message;
			options.type = "whisper";
		}
		// Found smiley
		var msg = smileyRegExp.map(data.message, function(r){
          	return switch(r.matched(0)){
                case ":)": '<img src="img/lol.png" class="smiley"/>';
                case ":(": '<img src="img/triste.png" class="smiley"/>';
                case ";)": '<img src="img/clin oeil.png" class="smiley"/>';
                case ":'(": '<img src="img/victime.png" class="smiley"/>';
                case ":|": '<img src="img/blaze.png" class="smiley"/>';
                case ":p": '<img src="img/langue.png" class="smiley"/>';
                case ":o": '<img src="img/gum.png" class="smiley"/>';
                case ":O": '<img src="img/cri.png" class="smiley"/>';
                case "8)": '<img src="img/cool.png" class="smiley"/>';
                case "]:)": '<img src="img/mechant.png" class="smiley"/>';
                case "?.?": '<img src="img/pourquoi.png" class="smiley"/>';
                case "-.-": '<img src="img/dodo.png" class="smiley"/>';
                case "-.-'": '<img src="img/gene.png" class="smiley"/>';
                case "<3)": '<img src="img/coeur.png" class="smiley"/>';
                case "<3": '<img src="img/coeur simple.png" class="smiley"/>';
                case ":fran:": '<img src="img/fran.png" class="smiley"/>';
                case ":scott:": '<img src="img/scott.png" class="smiley"/>';
                case ":brit:": '<img src="img/brit.png" class="smiley"/>';
                case ":britchauve:": '<img src="img/brit chauve.png" class="smiley"/>';
                case ":fdt:": '<img src="img/fran vnr.png" class="smiley"/>';
                case ":berk:": '<img src="img/vomi.png" class="smiley"/>';
                case ":kiss:": '<img src="img/meuf.png" class="smiley"/>';
                case ":gun:": '<img src="img/gun.png" class="smiley"/>';
                case ":glups:": '<img src="img/glups.png" class="smiley"/>';
                case ":-18:": '<img src="img/-18.png" class="smiley"/>';
                default: r.matched(0);
            };
        });
		// Found links
		if(urlRegExp.match(msg)){
            var link = urlRegExp.matched(0);
            msg = urlRegExp.matchedLeft();
            msg += switch(link.substr(link.lastIndexOf(".")+1)){
                    case "gif" | "png" | "jpg" |"jpeg":
                		'<a target="_blank" href="$link"><img class="preview" src="$link"></a>';
                	default: '<a target="_blank" href="$link">$link</a>';
            }
            msg += urlRegExp.matchedRight();
        }
        
		var messageBodyDiv = new JQuery('<span class="messageBody">'+msg+"</span>");
		//.text(data.message);
		var typingClass = data.typing ? 'typing' : '';
		var messageDiv = new JQuery('<li class="message"/>')
		.data('username', data.username)
		.addClass(typingClass)
		.append(usernameDiv).append(messageBodyDiv);
		if(Reflect.hasField(options, "type"))
			messageDiv.addClass(options.type);
		addMessageElement(messageDiv, options);
	}


	// Adds the visual chat typing message
	function addChatTyping(data) {
		data.typing = true;
		data.message = 'is typing';
		addChatMessage(data);
	}

	// Removes the visual chat typing message
	function removeChatTyping (data) {
		getTypingMessages(data).fadeOut(function () {
			new JQuery(js.Lib.self).remove();
		});
	}

	 // Adds a message element to the messages and scrolls to the bottom
	// el - The element to add as a message
	// options.fade - If the element should fade-in (default = true)
	// options.prepend - If the element should prepend
	// all other messages (default = false)
	function addMessageElement (el: JQuery, ?options: Dynamic) {
		if(options == null){
			options = {};
		}
		if (options.fade == null) {
			options.fade = true;
		}
		if (options.prepend == null) {
			options.prepend = false;
		}
		// Apply options
		if (options.fade) {
			el.hide().fadeIn(FADE_TIME);
		}
		if (options.prepend) {
			messages.prepend(el);
		} else {
			messages.append(el);
		}
		messages[0].scrollTop = messages[0].scrollHeight;
	}


	// Prevents input from having injected markup
	function cleanInput (input) {
		return new JQuery('<div/>').text(input).text();
	}

	// Updates the typing event
	function updateTyping () {
		if (connected) {
			if (!typing) {
				typing = true;
				socket.emit('typing');
			}
			lastTypingTime = haxe.Timer.stamp();
			js.Browser.window.setTimeout(function () {
				var typingTimer = haxe.Timer.stamp();
				var timeDiff = typingTimer - lastTypingTime;
				if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
					socket.emit('stop typing');
					typing = false;
				}
			}, TYPING_TIMER_LENGTH);
		}
	}

	// Gets the 'X is typing' messages of a user
	function getTypingMessages (data): JQuery {
		return new JQuery('.typing.message').filter(function (i: Int, elem: Element) {
			return new JQuery(Lib.self).data('username') == data.username;
		});
	}


	// Gets the color of a username through our hash function
	function getUsernameColor (username: String) {
		// Compute hash code
		var hash = 7;
		for (i in 0...username.length) {
			hash = username.charCodeAt(i) + (hash << 5) - hash;
		}
		// Calculate color
		var index: Int = Std.int(Math.abs(hash % COLORS.length));
		return COLORS[index];
	}
}