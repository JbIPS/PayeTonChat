(function () { "use strict";
var EReg = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
var HxOverrides = function() { };
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
var Reflect = function() { };
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
var js = {};
js.Node = function() { };
js.npm = {};
js.npm.connect = {};
js.npm.connect.support = {};
js.npm.connect.support._Middleware = {};
js.npm.connect.support._Middleware.TMiddleware_Impl_ = function() { };
js.npm.connect.support._Middleware.TMiddleware_Impl_.fromMiddleware = function(middleware) {
	return middleware;
};
js.npm.connect.support._Middleware.TMiddleware_Impl_.fromAsync = function(method) {
	return method;
};
js.npm.connect.support._Middleware.TMiddleware_Impl_.fromSync = function(method) {
	return method;
};
js.support = {};
js.support._DynamicObject = {};
js.support._DynamicObject.DynamicObject_Impl_ = function() { };
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
js.support._RegExp.RegExp_Impl_.fromEReg = function(r) {
	return r.r;
};
js.support._RegExp.RegExp_Impl_.toEReg = function(r) {
	return new EReg(r.source,(r.ignoreCase?"i":"") + (r.global?"g":"") + (r.multiline?"m":""));
};
var server = {};
server.Main = function() {
	var app = new (Express__1||require("express"))();
	var server = (Http__8||require("http")).createServer(app);
	var io = js.Node.require("socket.io").listen(server);
	var port = 3000;
	server.listen(port,null,null,function() {
		console.log("Server listening at port " + port);
	});
	app["use"]((function($this) {
		var $r;
		var middleware = new (Static__6||require("serve-static"))(js.Node.__dirname + "/public");
		$r = middleware;
		return $r;
	}(this)));
	var usernames = new Array();
	var numUsers = 0;
	io.on("connection",function(socket) {
		var addedUser = false;
		socket.on("new message",function(data) {
			socket.broadcast.emit("new message",{ username : socket.username, message : data});
		});
		socket.on("add user",function(username) {
			socket.username = username;
			usernames.push(username);
			++numUsers;
			addedUser = true;
			socket.emit("login",{ usernames : usernames});
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
server.Main.main = function() {
	new server.Main();
};
if(Array.prototype.indexOf) HxOverrides.indexOf = function(a,o,i) {
	return Array.prototype.indexOf.call(a,o,i);
};
var Crypto__11 = require("crypto");
var EventEmitter__0 = require("events").EventEmitter;
var Http__8 = require("http");
var Net__14 = require("net");
var Url__12 = require("url");
var Agent__9 = require("http").Agent;
var ClientRequest__5 = require("http").ClientRequest;
var Server__10 = require("http").Server;
var Writable__3 = require("stream").Writable;
var ServerResponse__4 = require("http").ServerResponse;
var Server__15 = require("net").Server;
var Socket__13 = require("net").Socket;
var Readable__7 = require("stream").Readable;
var Express__1 = require("express");
var Static__6 = require("serve-static");
var Router__2 = require("express").Router;
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
