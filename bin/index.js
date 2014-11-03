(function () { "use strict";
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
	__class__: EReg
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
Math.__name__ = true;
var Reflect = function() { };
Reflect.__name__ = true;
Reflect.field = function(o,field) {
	try {
		return o[field];
	} catch( e ) {
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
var ValueType = { __ename__ : true, __constructs__ : ["TNull","TInt","TFloat","TBool","TObject","TFunction","TClass","TEnum","TUnknown"] };
ValueType.TNull = ["TNull",0];
ValueType.TNull.__enum__ = ValueType;
ValueType.TInt = ["TInt",1];
ValueType.TInt.__enum__ = ValueType;
ValueType.TFloat = ["TFloat",2];
ValueType.TFloat.__enum__ = ValueType;
ValueType.TBool = ["TBool",3];
ValueType.TBool.__enum__ = ValueType;
ValueType.TObject = ["TObject",4];
ValueType.TObject.__enum__ = ValueType;
ValueType.TFunction = ["TFunction",5];
ValueType.TFunction.__enum__ = ValueType;
ValueType.TClass = function(c) { var $x = ["TClass",6,c]; $x.__enum__ = ValueType; return $x; };
ValueType.TEnum = function(e) { var $x = ["TEnum",7,e]; $x.__enum__ = ValueType; return $x; };
ValueType.TUnknown = ["TUnknown",8];
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
		var c;
		if((v instanceof Array) && v.__enum__ == null) c = Array; else c = v.__class__;
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
var js = {};
js.Node = function() { };
js.Node.__name__ = true;
js.npm = {};
js.npm.connect = {};
js.npm.connect.support = {};
js.npm.connect.support._Middleware = {};
js.npm.connect.support._Middleware.TMiddleware_Impl_ = function() { };
js.npm.connect.support._Middleware.TMiddleware_Impl_.__name__ = true;
js.npm.connect.support._Middleware.TMiddleware_Impl_.fromMiddleware = function(middleware) {
	return middleware;
};
js.npm.connect.support._Middleware.TMiddleware_Impl_.fromAsync = function(method) {
	return method;
};
js.npm.connect.support._Middleware.TMiddleware_Impl_.fromSync = function(method) {
	return method;
};
js.npm.mongoose = {};
js.npm.mongoose.macro = {};
js.npm.mongoose.macro.Manager = function() { };
js.npm.mongoose.macro.Manager.__name__ = true;
js.npm.mongoose.macro.Manager.__super__ = {}
js.npm.mongoose.macro.Manager.prototype = $extend({}.prototype,{
	__class__: js.npm.mongoose.macro.Manager
});
js.npm.mongoose.macro.Model = function() { };
js.npm.mongoose.macro.Model.__name__ = true;
js.npm.mongoose.macro.Model.__super__ = (TModel__2||require("mongoose").Model);
js.npm.mongoose.macro.Model.prototype = $extend((TModel__2||require("mongoose").Model).prototype,{
	__class__: js.npm.mongoose.macro.Model
});
js.support = {};
js.support._DynamicObject = {};
js.support._DynamicObject.DynamicObject_Impl_ = function() { };
js.support._DynamicObject.DynamicObject_Impl_.__name__ = true;
js.support._DynamicObject.DynamicObject_Impl_._new = function() {
	return { };
};
js.support._DynamicObject.DynamicObject_Impl_.get = function(this1,key) {
	return Reflect.field(this1,key);
};
js.support._DynamicObject.DynamicObject_Impl_.set = function(this1,key,value) {
	this1[key] = value;
};
js.support._DynamicObject.DynamicObject_Impl_.exists = function(this1,key) {
	return Object.prototype.hasOwnProperty.call(this1,key);
};
js.support._DynamicObject.DynamicObject_Impl_.remove = function(this1,key) {
	return Reflect.deleteField(this1,key);
};
js.support._DynamicObject.DynamicObject_Impl_.keys = function(this1) {
	return Reflect.fields(this1);
};
js.support._RegExp = {};
js.support._RegExp.RegExp_Impl_ = function() { };
js.support._RegExp.RegExp_Impl_.__name__ = true;
js.support._RegExp.RegExp_Impl_.fromEReg = function(r) {
	return r.r;
};
js.support._RegExp.RegExp_Impl_.toEReg = function(r) {
	return new EReg(r.source,(r.ignoreCase?"i":"") + (r.global?"g":"") + (r.multiline?"m":""));
};
var server = {};
server.ChatHistory = function() { };
server.ChatHistory.__name__ = true;
server.ChatHistory.get_Schema = function() {
	if(server.ChatHistory._schema == null) {
		server.ChatHistory._schema = new (Schema__8||require("mongoose").Schema)({ message : { type : String}, username : { type : String}});
		var proto1 = server.ChatHistory.prototype;
		var _g = 0;
		var _g1 = Reflect.fields(proto1);
		while(_g < _g1.length) {
			var f = _g1[_g];
			++_g;
			var v = proto1[f];
			var _g2 = Type["typeof"](v);
			switch(_g2[1]) {
			case 5:
				server.ChatHistory._schema.methods[f] = v;
				break;
			default:
			}
		}
	}
	return server.ChatHistory._schema;
};
server.ChatHistory.__super__ = js.npm.mongoose.macro.Model;
server.ChatHistory.prototype = $extend(js.npm.mongoose.macro.Model.prototype,{
	__class__: server.ChatHistory
});
server.ChatHistoryManager = function() { };
server.ChatHistoryManager.__name__ = true;
server.ChatHistoryManager.build = function(mongoose,name,collectionName,skipInit) {
	var m = mongoose.model(name,server.ChatHistory.get_Schema(),collectionName,skipInit);
	var proto = server.ChatHistoryManager.prototype;
	var _g = 0;
	var _g1 = Reflect.fields(proto);
	while(_g < _g1.length) {
		var f = _g1[_g];
		++_g;
		m[f] = proto[f];
	}
	return m;
};
server.ChatHistoryManager.__super__ = js.npm.mongoose.macro.Manager;
server.ChatHistoryManager.prototype = $extend(js.npm.mongoose.macro.Manager.prototype,{
	__class__: server.ChatHistoryManager
});
server.Main = function() {
	var app = new (Express__13||require("express"))();
	var server1 = (Http__18||require("http")).createServer(app);
	var io = js.Node.require("socket.io").listen(server1);
	var db = (Mongoose__11||require("mongoose")).mongoose.connect("mongodb://localhost/chat");
	var history = server.ChatHistoryManager.build(db,"ChatHistory",null,null);
	var port = 3000;
	server1.listen(port,null,null,function() {
		console.log("Server listening at port " + port);
	});
	app["use"]((function($this) {
		var $r;
		var middleware = new (Static__17||require("serve-static"))(js.Node.__dirname + "/public");
		$r = middleware;
		return $r;
	}(this)));
	var usernames = new Array();
	var numUsers = 0;
	io.on("connection",function(socket) {
		var addedUser = false;
		socket.on("new message",function(data) {
			var user = socket.username;
			socket.broadcast.emit("new message",{ username : user, message : data});
			history.create({ username : user, message : data},function(err,doc) {
				if(err != null) console.log("Can't save chat history: " + err);
			});
		});
		socket.on("add user",function(username) {
			socket.username = username;
			usernames.push(username);
			++numUsers;
			addedUser = true;
			history.find({ },function(err1,results) {
				if(err1 != null) console.log("Can't get chat history: " + err1); else socket.emit("login",{ usernames : usernames, history : results.slice(0,51)});
			});
			socket.broadcast.emit("user joined",{ username : socket.username, numUsers : numUsers});
		});
		socket.on("typing",function() {
			socket.broadcast.emit("typing",{ username : socket.username});
		});
		socket.on("stop typing",function() {
			socket.broadcast.emit("stop typing",{ username : socket.username});
		});
		socket.on("disconnect",function() {
			if(addedUser) {
				var x = socket.username;
				HxOverrides.remove(usernames,x);
				--numUsers;
				socket.broadcast.emit("user left",{ username : socket.username, numUsers : numUsers});
			}
		});
	});
};
server.Main.__name__ = true;
server.Main.main = function() {
	new server.Main();
};
server.Main.prototype = {
	__class__: server.Main
};
if(Array.prototype.indexOf) HxOverrides.indexOf = function(a,o,i) {
	return Array.prototype.indexOf.call(a,o,i);
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
String.prototype.__class__ = String;
String.__name__ = true;
Array.__name__ = true;
var Crypto__21 = require("crypto");
var EventEmitter__0 = require("events").EventEmitter;
var Http__18 = require("http");
var Net__24 = require("net");
var Url__22 = require("url");
var Agent__19 = require("http").Agent;
var ClientRequest__16 = require("http").ClientRequest;
var Server__20 = require("http").Server;
var Writable__6 = require("stream").Writable;
var ServerResponse__15 = require("http").ServerResponse;
var Server__25 = require("net").Server;
var Socket__23 = require("net").Socket;
var Readable__5 = require("stream").Readable;
var Express__13 = require("express");
var Mongoose__11 = require("mongoose");
(Mongoose__11||require("mongoose")).mongoose = (Mongoose__11||require("mongoose"));
var Static__17 = require("serve-static");
var Router__14 = require("express").Router;
var Connection__10 = require("mongoose").Connection;
var Document__1 = require("mongoose").Document;
var TModel__2 = require("mongoose").Model;
var Mongoose__12 = require("mongoose").Mongoose;
var Promise__7 = require("mongoose").Promise;
var Schema__8 = require("mongoose").Schema;
var SchemaType__3 = require("mongoose").SchemaType;
var VirtualType__9 = require("mongoose").VirtualType;
var ObjectId__4 = require("mongoose").Schema.Types.ObjectId;
js.Node.console = console;
js.Node.process = process;
js.Node.module = module;
js.Node.exports = exports;
js.Node.__filename = __filename;
js.Node.__dirname = __dirname;
js.Node.require = require;
js.Node.setTimeout = setTimeout;
js.Node.setInterval = setInterval;
js.Node.clearTimeout = clearTimeout;
js.Node.clearInterval = clearInterval;
server.Main.main();
})();
