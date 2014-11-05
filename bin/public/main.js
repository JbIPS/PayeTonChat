(function () { "use strict";
var EReg = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
EReg.__name__ = true;
EReg.prototype = {
	match: function(s) {
		if(this.r.global) this.r.lastIndex = 0;
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
	,matched: function(n) {
		if(this.r.m != null && n >= 0 && n < this.r.m.length) return this.r.m[n]; else throw "EReg::matched";
	}
	,matchedLeft: function() {
		if(this.r.m == null) throw "No string matched";
		return this.r.s.substr(0,this.r.m.index);
	}
	,matchedRight: function() {
		if(this.r.m == null) throw "No string matched";
		var sz = this.r.m.index + this.r.m[0].length;
		return this.r.s.substr(sz,this.r.s.length - sz);
	}
	,matchedPos: function() {
		if(this.r.m == null) throw "No string matched";
		return { pos : this.r.m.index, len : this.r.m[0].length};
	}
	,matchSub: function(s,pos,len) {
		if(len == null) len = -1;
		if(this.r.global) {
			this.r.lastIndex = pos;
			this.r.m = this.r.exec(len < 0?s:HxOverrides.substr(s,0,pos + len));
			var b = this.r.m != null;
			if(b) this.r.s = s;
			return b;
		} else {
			var b1 = this.match(len < 0?HxOverrides.substr(s,pos,null):HxOverrides.substr(s,pos,len));
			if(b1) {
				this.r.s = s;
				this.r.m.index += pos;
			}
			return b1;
		}
	}
	,replace: function(s,by) {
		return s.replace(this.r,by);
	}
	,map: function(s,f) {
		var offset = 0;
		var buf = new StringBuf();
		do {
			if(offset >= s.length) break; else if(!this.matchSub(s,offset)) {
				buf.add(HxOverrides.substr(s,offset,null));
				break;
			}
			var p = this.matchedPos();
			buf.add(HxOverrides.substr(s,offset,p.pos - offset));
			buf.add(f(this));
			if(p.len == 0) {
				buf.add(HxOverrides.substr(s,p.pos,1));
				offset = p.pos + 1;
			} else offset = p.pos + p.len;
		} while(this.r.global);
		if(!this.r.global && offset > 0 && offset < s.length) buf.add(HxOverrides.substr(s,offset,null));
		return buf.b;
	}
};
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
};
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
};
Math.__name__ = true;
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
};
Std["int"] = function(x) {
	return x | 0;
};
var StringBuf = function() {
	this.b = "";
};
StringBuf.__name__ = true;
StringBuf.prototype = {
	add: function(x) {
		this.b += Std.string(x);
	}
};
var StringTools = function() { };
StringTools.__name__ = true;
StringTools.startsWith = function(s,start) {
	return s.length >= start.length && HxOverrides.substr(s,0,start.length) == start;
};
StringTools.isSpace = function(s,pos) {
	var c = HxOverrides.cca(s,pos);
	return c > 8 && c < 14 || c == 32;
};
StringTools.ltrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) r++;
	if(r > 0) return HxOverrides.substr(s,r,l - r); else return s;
};
StringTools.rtrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,l - r - 1)) r++;
	if(r > 0) return HxOverrides.substr(s,0,l - r); else return s;
};
StringTools.trim = function(s) {
	return StringTools.ltrim(StringTools.rtrim(s));
};
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
};
var client = {};
client.Main = function() {
	this.typing = false;
	this.connected = false;
	this.COLORS = ["#e21400","#91580f","#f8a700","#f78b00","#58dc00","#287b00","#a8f07a","#4ae8c4","#3b88eb","#3824aa","#a700ff","#d300e7"];
	this.TYPING_TIMER_LENGTH = 400;
	this.FADE_TIME = 150;
	var _g = this;
	this.usernameInput = new jQuery(".usernameInput");
	this.messages = new jQuery(".messages");
	this.inputMessage = new jQuery(".inputMessage");
	this.loginPage = new jQuery(".login.page");
	this.chatPage = new jQuery(".chat.page");
	this.participantList = new jQuery(".participants ul");
	this.smileyContainer = new jQuery(".smileyContainer");
	new jQuery(".smileyButton").click(function(e) {
		_g.smileyContainer.fadeIn();
	});
	this.currentInput = this.usernameInput.focus();
	this.socket = io.connect();
	this.urlRegExp = new EReg("(\\b(https?|ftp|file)://[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])","ig");
	this.smileyRegExp = new EReg("(\\]:\\)|[:;][\\S]+|8\\)|:.+:|\\S\\.\\S{1,2}|<3\\)?)","g");
	this.whisperRegExp = new EReg("^@(.+?):","");
	new jQuery(window).keydown(function(event) {
		if(!(event.ctrlKey || event.metaKey || event.altKey)) _g.currentInput.focus();
		if(event.which == 13) {
			if(_g.username != null) {
				_g.sendMessage();
				_g.socket.emit("stop typing");
				_g.typing = false;
			} else _g.setUsername();
		}
	});
	this.inputMessage.on("input",function(_) {
		if(this.value.charAt(0) != "@") _g.updateTyping();
	});
	this.loginPage.click(function() {
		_g.currentInput.focus();
	});
	this.inputMessage.click(function() {
		_g.inputMessage.focus();
	});
	this.socket.on("login",function(data) {
		var message = "Bienvenue sur PayeTonChat !";
		_g.log(message,{ prepend : true});
		var usernames = data.usernames;
		var history = data.history;
		var _g1 = 0;
		while(_g1 < usernames.length) {
			var u = usernames[_g1];
			++_g1;
			_g.addParticipantsMessage(u);
		}
		var _g11 = 0;
		while(_g11 < history.length) {
			var h = history[_g11];
			++_g11;
			_g.addChatMessage(h);
		}
	});
	this.socket.on("new message",function(data1) {
		var sound = new Audio();
		sound.src = "sounds/new_msg.mp3";
		_g.addChatMessage(data1);
		sound.play();
	});
	this.socket.on("user joined",function(data2) {
		_g.log(data2.username + " joined");
		var sound1 = new Audio();
		sound1.src = "sounds/new_connection.mp3";
		_g.addParticipantsMessage(data2.username);
		sound1.play();
	});
	this.socket.on("user left",function(data3) {
		_g.log(data3.username + " left");
		var sound2 = new Audio();
		sound2.src = "sounds/user_leaving.mp3";
		_g.addParticipantsMessage(data3.username,false);
		_g.removeChatTyping(data3);
		sound2.play();
	});
	this.socket.on("new action",function(action) {
		_g.log(action);
	});
	this.socket.on("typing",function(data4) {
		_g.addChatTyping(data4);
	});
	this.socket.on("stop typing",function(data5) {
		_g.removeChatTyping(data5);
	});
	this.socket.on("disconnect",function(data6) {
		console.log("Unable to reach the server");
		_g.connected = false;
	});
	this.socket.on("connect",function(data7) {
		console.log("Connection");
		if(_g.username != null) _g.socket.emit("socket reconnect",_g.username,function() {
			_g.connected = true;
		});
	});
};
client.Main.__name__ = true;
client.Main.main = function() {
	new client.Main();
};
client.Main.prototype = {
	addParticipantsMessage: function(name,connection) {
		if(connection == null) connection = true;
		var _g = this;
		if(connection) {
			var li = new jQuery("<li/>");
			new jQuery("<a><span class='glyphicon glyphicon-user'></span>" + name + "</a>").click(function(e) {
				if(this.textContent == _g.username) _g.inputMessage.val("\\u "); else _g.inputMessage.val("@" + Std.string(this.textContent) + ": ");
				_g.inputMessage.focus();
			}).appendTo(li);
			this.participantList.append(li);
		} else this.participantList.children("li").each(function() {
			if(this.textContent == name) this.remove();
		});
	}
	,setUsername: function() {
		this.username = this.cleanInput(StringTools.trim(this.usernameInput.val()));
		if(this.username != "") {
			this.loginPage.fadeOut();
			this.chatPage.show();
			this.loginPage.off("click");
			this.currentInput = this.inputMessage.focus();
			this.socket.emit("add user",this.username);
			this.connected = true;
		} else this.username = null;
	}
	,sendMessage: function() {
		var message = this.inputMessage.val();
		message = this.cleanInput(message);
		if(message != null && this.connected) {
			this.inputMessage.val("");
			var data = { username : this.username, message : message};
			if(StringTools.startsWith(message,"\\u")) {
				var msg = StringTools.replace(message,"\\u",this.username);
				this.socket.emit("new action",msg);
				this.log(msg);
			} else {
				if(this.whisperRegExp.match(message)) data.whisperTarget = this.whisperRegExp.matched(1);
				this.addChatMessage(data);
				this.socket.emit("new message",message);
			}
		}
	}
	,log: function(message,options) {
		var el = new jQuery("<li>").addClass("log").text(message);
		this.addMessageElement(el,options);
	}
	,addChatMessage: function(data,options) {
		var typingMessages = this.getTypingMessages(data);
		if(options == null) options = { };
		if(typingMessages.length != 0) {
			options.fade = false;
			typingMessages.remove();
		}
		var usernameDiv = new jQuery("<span class=\"username\"/>").text(data.username).css("color",this.getUsernameColor(data.username));
		if(this.whisperRegExp.match(data.message)) {
			data.message = this.whisperRegExp.replace(data.message,"");
			if(Object.prototype.hasOwnProperty.call(data,"whisperTarget") && data.whisperTarget != null) data.message = Std.string(data.whisperTarget) + " > " + Std.string(data.message);
			options.type = "whisper";
		}
		var msg = this.smileyRegExp.map(data.message,function(r) {
			var _g = r.matched(0);
			switch(_g) {
			case ":)":
				return "<img src=\"img/lol.png\" class=\"smiley\"/>";
			case ":(":
				return "<img src=\"img/triste.png\" class=\"smiley\"/>";
			case ";)":
				return "<img src=\"img/clin oeil.png\" class=\"smiley\"/>";
			case ":'(":
				return "<img src=\"img/victime.png\" class=\"smiley\"/>";
			case ":|":
				return "<img src=\"img/blaze.png\" class=\"smiley\"/>";
			case ":p":
				return "<img src=\"img/langue.png\" class=\"smiley\"/>";
			case ":o":
				return "<img src=\"img/gum.png\" class=\"smiley\"/>";
			case ":O":
				return "<img src=\"img/cri.png\" class=\"smiley\"/>";
			case "8)":
				return "<img src=\"img/cool.png\" class=\"smiley\"/>";
			case "]:)":
				return "<img src=\"img/mechant.png\" class=\"smiley\"/>";
			case "?.?":
				return "<img src=\"img/pourquoi.png\" class=\"smiley\"/>";
			case "-.-":
				return "<img src=\"img/dodo.png\" class=\"smiley\"/>";
			case "-.-'":
				return "<img src=\"img/gene.png\" class=\"smiley\"/>";
			case "<3)":
				return "<img src=\"img/coeur.png\" class=\"smiley\"/>";
			case "<3":
				return "<img src=\"img/coeur simple.png\" class=\"smiley\"/>";
			case ":fran:":
				return "<img src=\"img/fran.png\" class=\"smiley\"/>";
			case ":scott:":
				return "<img src=\"img/scott.png\" class=\"smiley\"/>";
			case ":brit:":
				return "<img src=\"img/brit.png\" class=\"smiley\"/>";
			case ":britchauve:":
				return "<img src=\"img/brit chauve.png\" class=\"smiley\"/>";
			case ":fdt:":
				return "<img src=\"img/fran vnr.png\" class=\"smiley\"/>";
			case ":berk:":
				return "<img src=\"img/vomi.png\" class=\"smiley\"/>";
			case ":kiss:":
				return "<img src=\"img/meuf.png\" class=\"smiley\"/>";
			case ":gun:":
				return "<img src=\"img/gun.png\" class=\"smiley\"/>";
			case ":glups:":
				return "<img src=\"img/glups.png\" class=\"smiley\"/>";
			case ":-18:":
				return "<img src=\"img/-18.png\" class=\"smiley\"/>";
			default:
				return r.matched(0);
			}
		});
		if(this.urlRegExp.match(msg)) {
			var link = this.urlRegExp.matched(0);
			msg = this.urlRegExp.matchedLeft();
			var _g1;
			var pos = link.lastIndexOf(".") + 1;
			_g1 = HxOverrides.substr(link,pos,null);
			switch(_g1) {
			case "gif":case "png":case "jpg":case "jpeg":
				msg += "<a target=\"_blank\" href=\"" + link + "\"><img class=\"preview\" src=\"" + link + "\"></a>";
				break;
			default:
				msg += "<a target=\"_blank\" href=\"" + link + "\">" + link + "</a>";
			}
			msg += this.urlRegExp.matchedRight();
		}
		var messageBodyDiv = new jQuery("<span class=\"messageBody\">" + msg + "</span>");
		var typingClass;
		if(data.typing) typingClass = "typing"; else typingClass = "";
		var messageDiv = new jQuery("<li class=\"message\"/>").data("username",data.username).addClass(typingClass).append(usernameDiv).append(messageBodyDiv);
		if(Object.prototype.hasOwnProperty.call(options,"type")) messageDiv.addClass(options.type);
		this.addMessageElement(messageDiv,options);
	}
	,addChatTyping: function(data) {
		data.typing = true;
		data.message = "is typing";
		this.addChatMessage(data);
	}
	,removeChatTyping: function(data) {
		this.getTypingMessages(data).fadeOut(null,function() {
			new jQuery(this).remove();
		});
	}
	,addMessageElement: function(el,options) {
		if(options == null) options = { };
		if(options.fade == null) options.fade = true;
		if(options.prepend == null) options.prepend = false;
		if(options.fade) el.hide().fadeIn(this.FADE_TIME);
		if(options.prepend) this.messages.prepend(el); else this.messages.append(el);
		this.messages[0].scrollTop = this.messages[0].scrollHeight;
	}
	,cleanInput: function(input) {
		return new jQuery("<div/>").text(input).text();
	}
	,updateTyping: function() {
		var _g = this;
		if(this.connected) {
			if(!this.typing) {
				this.typing = true;
				this.socket.emit("typing");
			}
			this.lastTypingTime = haxe.Timer.stamp();
			window.setTimeout(function() {
				var typingTimer = haxe.Timer.stamp();
				var timeDiff = typingTimer - _g.lastTypingTime;
				if(timeDiff >= _g.TYPING_TIMER_LENGTH && _g.typing) {
					_g.socket.emit("stop typing");
					_g.typing = false;
				}
			},this.TYPING_TIMER_LENGTH);
		}
	}
	,getTypingMessages: function(data) {
		return new jQuery(".typing.message").filter(function(i,elem) {
			return new jQuery(this).data("username") == data.username;
		});
	}
	,getUsernameColor: function(username) {
		var hash = 7;
		var _g1 = 0;
		var _g = username.length;
		while(_g1 < _g) {
			var i = _g1++;
			hash = HxOverrides.cca(username,i) + (hash << 5) - hash;
		}
		var index = Std["int"](Math.abs(hash % this.COLORS.length));
		return this.COLORS[index];
	}
};
var haxe = {};
haxe.Timer = function() { };
haxe.Timer.__name__ = true;
haxe.Timer.stamp = function() {
	return new Date().getTime() / 1000;
};
var js = {};
js.Boot = function() { };
js.Boot.__name__ = true;
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) str += "," + js.Boot.__string_rec(o[i],s); else str += js.Boot.__string_rec(o[i],s);
				}
				return str + ")";
			}
			var l = o.length;
			var i1;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js.Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str2 = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str2.length != 2) str2 += ", \n";
		str2 += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str2 += "\n" + s + "}";
		return str2;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
js.Lib = function() { };
js.Lib.__name__ = true;
js.Lib.debug = function() {
	debugger;
};
js.Lib["eval"] = function(code) {
	return eval(code);
};
js.Lib.get_arguments = function() {
	return arguments;
};
js.Lib.get_self = function() {
	return this;
};
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i1) {
	return isNaN(i1);
};
String.__name__ = true;
Array.__name__ = true;
Date.__name__ = ["Date"];
client.Main.main();
})();
