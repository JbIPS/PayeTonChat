(function (console) { "use strict";
var $estr = function() { return js_Boot.__string_rec(this,''); };
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
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
		if(this.r.m != null && n >= 0 && n < this.r.m.length) return this.r.m[n]; else throw new js__$Boot_HaxeError("EReg::matched");
	}
	,__class__: EReg
};
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.indexOf = function(a,obj,i) {
	var len = a.length;
	if(i < 0) {
		i += len;
		if(i < 0) i = 0;
	}
	while(i < len) {
		if(a[i] === obj) return i;
		i++;
	}
	return -1;
};
HxOverrides.remove = function(a,obj) {
	var i = HxOverrides.indexOf(a,obj,0);
	if(i == -1) return false;
	a.splice(i,1);
	return true;
};
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
};
var Lambda = function() { };
Lambda.__name__ = true;
Lambda.find = function(it,f) {
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var v = $it0.next();
		if(f(v)) return v;
	}
	return null;
};
Math.__name__ = true;
var Reflect = function() { };
Reflect.__name__ = true;
Reflect.field = function(o,field) {
	try {
		return o[field];
	} catch( e ) {
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		return null;
	}
};
Reflect.fields = function(o) {
	var a = [];
	if(o != null) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		for( var f in o ) {
		if(f != "__id__" && f != "hx__closures__" && hasOwnProperty.call(o,f)) a.push(f);
		}
	}
	return a;
};
Reflect.deleteField = function(o,field) {
	if(!Object.prototype.hasOwnProperty.call(o,field)) return false;
	delete(o[field]);
	return true;
};
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
var ValueType = { __ename__ : true, __constructs__ : ["TNull","TInt","TFloat","TBool","TObject","TFunction","TClass","TEnum","TUnknown"] };
ValueType.TNull = ["TNull",0];
ValueType.TNull.toString = $estr;
ValueType.TNull.__enum__ = ValueType;
ValueType.TInt = ["TInt",1];
ValueType.TInt.toString = $estr;
ValueType.TInt.__enum__ = ValueType;
ValueType.TFloat = ["TFloat",2];
ValueType.TFloat.toString = $estr;
ValueType.TFloat.__enum__ = ValueType;
ValueType.TBool = ["TBool",3];
ValueType.TBool.toString = $estr;
ValueType.TBool.__enum__ = ValueType;
ValueType.TObject = ["TObject",4];
ValueType.TObject.toString = $estr;
ValueType.TObject.__enum__ = ValueType;
ValueType.TFunction = ["TFunction",5];
ValueType.TFunction.toString = $estr;
ValueType.TFunction.__enum__ = ValueType;
ValueType.TClass = function(c) { var $x = ["TClass",6,c]; $x.__enum__ = ValueType; $x.toString = $estr; return $x; };
ValueType.TEnum = function(e) { var $x = ["TEnum",7,e]; $x.__enum__ = ValueType; $x.toString = $estr; return $x; };
ValueType.TUnknown = ["TUnknown",8];
ValueType.TUnknown.toString = $estr;
ValueType.TUnknown.__enum__ = ValueType;
var Type = function() { };
Type.__name__ = true;
Type["typeof"] = function(v) {
	var _g = typeof(v);
	switch(_g) {
	case "boolean":
		return ValueType.TBool;
	case "string":
		return ValueType.TClass(String);
	case "number":
		if(Math.ceil(v) == v % 2147483648.0) return ValueType.TInt;
		return ValueType.TFloat;
	case "object":
		if(v == null) return ValueType.TNull;
		var e = v.__enum__;
		if(e != null) return ValueType.TEnum(e);
		var c = js_Boot.getClass(v);
		if(c != null) return ValueType.TClass(c);
		return ValueType.TObject;
	case "function":
		if(v.__name__ || v.__ename__) return ValueType.TObject;
		return ValueType.TFunction;
	case "undefined":
		return ValueType.TNull;
	default:
		return ValueType.TUnknown;
	}
};
var js__$Boot_HaxeError = function(val) {
	Error.call(this);
	this.val = val;
	this.message = String(val);
	if(Error.captureStackTrace) Error.captureStackTrace(this,js__$Boot_HaxeError);
};
js__$Boot_HaxeError.__name__ = true;
js__$Boot_HaxeError.__super__ = Error;
js__$Boot_HaxeError.prototype = $extend(Error.prototype,{
	__class__: js__$Boot_HaxeError
});
var js_Boot = function() { };
js_Boot.__name__ = true;
js_Boot.getClass = function(o) {
	if((o instanceof Array) && o.__enum__ == null) return Array; else {
		var cl = o.__class__;
		if(cl != null) return cl;
		var name = js_Boot.__nativeClassName(o);
		if(name != null) return js_Boot.__resolveNativeClass(name);
		return null;
	}
};
js_Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str2 = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i1 = _g1++;
					if(i1 != 2) str2 += "," + js_Boot.__string_rec(o[i1],s); else str2 += js_Boot.__string_rec(o[i1],s);
				}
				return str2 + ")";
			}
			var l = o.length;
			var i;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js_Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			return "???";
		}
		if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js_Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
js_Boot.__nativeClassName = function(o) {
	var name = js_Boot.__toStr.call(o).slice(8,-1);
	if(name == "Object" || name == "Function" || name == "Math" || name == "JSON") return null;
	return name;
};
js_Boot.__resolveNativeClass = function(name) {
	return (Function("return typeof " + name + " != \"undefined\" ? " + name + " : null"))();
};
var js_Node = function() { };
js_Node.__name__ = true;
var js_node_events_IEventEmitter = function() { };
js_node_events_IEventEmitter.__name__ = true;
js_node_events_IEventEmitter.prototype = {
	__class__: js_node_events_IEventEmitter
};
var js_node_IHttpServerListener = function() { };
js_node_IHttpServerListener.__name__ = true;
var js_node_stream_IWritable = function() { };
js_node_stream_IWritable.__name__ = true;
js_node_stream_IWritable.__interfaces__ = [js_node_events_IEventEmitter];
js_node_stream_IWritable.prototype = {
	__class__: js_node_stream_IWritable
};
var js_node_stream_IReadable = function() { };
js_node_stream_IReadable.__name__ = true;
js_node_stream_IReadable.__interfaces__ = [js_node_events_IEventEmitter];
js_node_stream_IReadable.prototype = {
	__class__: js_node_stream_IReadable
};
var js_node_stream_IDuplex = function() { };
js_node_stream_IDuplex.__name__ = true;
js_node_stream_IDuplex.__interfaces__ = [js_node_stream_IReadable,js_node_stream_IWritable];
var js_npm_express__$Route_Route_$Impl_$ = {};
js_npm_express__$Route_Route_$Impl_$.__name__ = true;
js_npm_express__$Route_Route_$Impl_$.fromEReg = function(e) {
	return e.r;
};
var js_npm_mongoose_macro_Manager = function() { };
js_npm_mongoose_macro_Manager.__name__ = true;
js_npm_mongoose_macro_Manager.__super__ = {}
js_npm_mongoose_macro_Manager.prototype = $extend({}.prototype,{
	__class__: js_npm_mongoose_macro_Manager
});
var js_npm_mongoose_macro_Model = function() { };
js_npm_mongoose_macro_Model.__name__ = true;
js_npm_mongoose_macro_Model.__super__ = (TModel__2||require("mongoose").Model);
js_npm_mongoose_macro_Model.prototype = $extend((TModel__2||require("mongoose").Model).prototype,{
	__class__: js_npm_mongoose_macro_Model
});
var js_support__$DynamicObject_DynamicObject_$Impl_$ = {};
js_support__$DynamicObject_DynamicObject_$Impl_$.__name__ = true;
js_support__$DynamicObject_DynamicObject_$Impl_$._new = function() {
	return { };
};
js_support__$DynamicObject_DynamicObject_$Impl_$.get = function(this1,key) {
	return Reflect.field(this1,key);
};
js_support__$DynamicObject_DynamicObject_$Impl_$.set = function(this1,key,value) {
	this1[key] = value;
};
js_support__$DynamicObject_DynamicObject_$Impl_$.exists = function(this1,key) {
	return Object.prototype.hasOwnProperty.call(this1,key);
};
js_support__$DynamicObject_DynamicObject_$Impl_$.remove = function(this1,key) {
	return Reflect.deleteField(this1,key);
};
js_support__$DynamicObject_DynamicObject_$Impl_$.keys = function(this1) {
	return Reflect.fields(this1);
};
var server_ChatHistory = function() { };
server_ChatHistory.__name__ = true;
server_ChatHistory.get_Schema = function() {
	if(server_ChatHistory._schema == null) {
		server_ChatHistory._schema = new (Schema__8||require("mongoose").Schema)({ message : { type : String}, username : { type : String}, whisperTarget : { type : String, optional : true}},{ });
		var proto1 = server_ChatHistory.prototype;
		var _g = 0;
		var _g1 = Reflect.fields(proto1);
		while(_g < _g1.length) {
			var f = _g1[_g];
			++_g;
			var v = proto1[f];
			var _g2 = Type["typeof"](v);
			switch(_g2[1]) {
			case 5:
				server_ChatHistory._schema.methods[f] = v;
				break;
			default:
			}
		}
	}
	return server_ChatHistory._schema;
};
server_ChatHistory.__super__ = js_npm_mongoose_macro_Model;
server_ChatHistory.prototype = $extend(js_npm_mongoose_macro_Model.prototype,{
	__class__: server_ChatHistory
});
var server_ChatHistoryManager = function() { };
server_ChatHistoryManager.__name__ = true;
server_ChatHistoryManager.build = function(mongoose,name,collectionName,skipInit) {
	var m = mongoose.model(name,server_ChatHistory.get_Schema(),collectionName,skipInit);
	var proto = server_ChatHistoryManager.prototype;
	var _g = 0;
	var _g1 = Reflect.fields(proto);
	while(_g < _g1.length) {
		var f = _g1[_g];
		++_g;
		m[f] = proto[f];
	}
	return m;
};
server_ChatHistoryManager.__super__ = js_npm_mongoose_macro_Manager;
server_ChatHistoryManager.prototype = $extend(js_npm_mongoose_macro_Manager.prototype,{
	__class__: server_ChatHistoryManager
});
var server_Main = function() {
	var app = new (Express__27||require("express"))();
	var server1 = (Http__15||require("http")).createServer(app);
	var io = js_Node.require("socket.io").listen(server1);
	var db = (Mongoose__11||require("mongoose")).mongoose.connect("mongodb://localhost:27017/");
	var history = server_ChatHistoryManager.build(db,"ChatHistory",null,null);
	var port = process.env.PORT || 3000;
	server1.listen(port,null,null,function() {
		console.log("Server listening at port " + port);
	});
	app["use"](new (Static__13||require("express").static)(js_Node.__dirname + "/public"));
	var usernames = [];
	var numUsers = 0;
	var whisperRegExp = new EReg("^@(.+)?: ","");
	io.on("connection",function(socket) {
		var addedUser = false;
		socket.on("new message",function(data) {
			console.log("New msg from " + Std.string(socket.username) + ": " + data);
			var user = socket.username;
			var target = null;
			if(whisperRegExp.match(data)) {
				target = Lambda.find(usernames,function(user1) {
					return user1.toLowerCase() == whisperRegExp.matched(1).toLowerCase();
				});
				console.log("match! " + whisperRegExp.matched(1));
				console.log("users: " + Std.string(usernames));
				socket.to(target).emit("new message",{ username : user, message : data});
			} else socket.broadcast.emit("new message",{ username : user, message : data});
			if(user != null) history.create({ username : user, message : data, whisperTarget : target},function(err,doc) {
				if(err != null) console.log("Can't save chat history: " + Std.string(err));
			}); else console.log("User is null for message: " + data);
		});
		socket.on("new action",function(action) {
			socket.broadcast.emit("new action",action);
		});
		socket.on("add user",function(username) {
			socket.username = username;
			socket.join(username);
			if(HxOverrides.indexOf(usernames,username,0) == -1) {
				usernames.push(username);
				++numUsers;
				addedUser = true;
			} else console.log("Already taken username " + username);
			history.find({ },function(err1,results) {
				if(err1 != null) console.log("Can't get chat history: " + Std.string(err1)); else socket.emit("login",{ usernames : usernames, history : results.filter(function(h) {
					return h.whisperTarget == null || (h.whisperTarget == username || h.username == username);
				}).slice(-50)});
			});
			socket.broadcast.emit("user joined",{ username : socket.username, numUsers : numUsers});
		});
		socket.on("typing",function() {
			socket.broadcast.emit("typing",{ username : socket.username != null?socket.username:"unknown"});
		});
		socket.on("stop typing",function() {
			socket.broadcast.emit("stop typing",{ username : socket.username != null?socket.username:"unknown"});
		});
		socket.on("disconnect",function() {
			console.log("Disconnect: " + Std.string(socket.username) + ". Added user ? " + (addedUser == null?"null":"" + addedUser));
			var x = socket.username;
			HxOverrides.remove(usernames,x);
			--numUsers;
			socket.broadcast.emit("user left",{ username : socket.username, numUsers : numUsers});
		});
		socket.on("socket reconnect",function(username1,cb) {
			console.log("Reconnect: " + username1);
			if(username1 != null) {
				socket.username = username1;
				usernames.push(username1);
				cb();
			}
		});
	});
};
server_Main.__name__ = true;
server_Main.main = function() {
	new server_Main();
};
server_Main.prototype = {
	__class__: server_Main
};
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; }
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
if(Array.prototype.indexOf) HxOverrides.indexOf = function(a,o,i) {
	return Array.prototype.indexOf.call(a,o,i);
};
String.prototype.__class__ = String;
String.__name__ = true;
Array.__name__ = true;
if(Array.prototype.filter == null) Array.prototype.filter = function(f1) {
	var a1 = [];
	var _g11 = 0;
	var _g2 = this.length;
	while(_g11 < _g2) {
		var i1 = _g11++;
		var e = this[i1];
		if(f1(e)) a1.push(e);
	}
	return a1;
};
var Crypto__18 = require("crypto");
var EventEmitter__0 = require("events").EventEmitter;
var Http__15 = require("http");
var Net__22 = require("net");
var Url__20 = require("url");
var Stats__25 = require("fs").Stats;
var Agent__16 = require("http").Agent;
var ClientRequest__24 = require("http").ClientRequest;
var Server__17 = require("http").Server;
var Writable__6 = require("stream").Writable;
var ServerResponse__26 = require("http").ServerResponse;
var Server__23 = require("net").Server;
var Socket__21 = require("net").Socket;
var Duplex__19 = require("stream").Duplex;
var Readable__5 = require("stream").Readable;
var Express__27 = require("express");
var Mongoose__11 = require("mongoose");
(Mongoose__11||require("mongoose")).mongoose = (Mongoose__11||require("mongoose"));
var Router__14 = require("express").Router;
var Static__13 = require("express")["static"];
var Connection__10 = require("mongoose").Connection;
var Document__1 = require("mongoose").Document;
var TModel__2 = require("mongoose").Model;
var Mongoose__12 = require("mongoose").Mongoose;
var Promise__7 = require("mongoose").Promise;
var Schema__8 = require("mongoose").Schema;
var SchemaType__3 = require("mongoose").SchemaType;
var VirtualType__9 = require("mongoose").VirtualType;
var ObjectId__4 = require("mongoose").Schema.Types.ObjectId;
js_Boot.__toStr = {}.toString;
js_Node.console = console;
js_Node.process = process;
js_Node.module = module;
js_Node.exports = exports;
js_Node.__filename = __filename;
js_Node.__dirname = __dirname;
js_Node.require = require;
js_Node.setTimeout = setTimeout;
js_Node.setInterval = setInterval;
js_Node.clearTimeout = clearTimeout;
js_Node.clearInterval = clearInterval;
server_Main.main();
})(typeof console != "undefined" ? console : {log:function(){}});
