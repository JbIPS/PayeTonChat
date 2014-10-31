package server;

import js.Node;
import js.npm.connect.Static;
import js.npm.Express;
import js.npm.socketio.Socket;
import js.support.DynamicObject;

class Main
{
	public static function main():Void
	{
	    new Main();
	}

	public function new(){
		var app = new Express();
		var server = js.node.Http.createServer(app);
		var io = js.Node.require('socket.io').listen(server);

		var port = 3000;

		server.listen(port, function () {
			trace('Server listening at port '+port);
		});

		// Routing
		app.use(new Static( Node.__dirname + "/public" ));
		// Chatroom
		// usernames which are currently connected to the chat
		var usernames = new Array<String>();
		var numUsers = 0;
		io.on('connection', function (socket: Socket) {
			var addedUser = false;
			// when the client emits 'new message', this listens and executes
			socket.on('new message', function (data) {
				// we tell the client to execute 'new message'
				socket.broadcast.emit('new message', {
					username: socket.username,
					message: data
				});
			});
			// when the client emits 'add user', this listens and executes
			socket.on('add user', function (username) {
				// we store the username in the socket session for this client
				socket.username = username;
				// add the client's username to the global list
				usernames.push(username);
				++numUsers;
				addedUser = true;
				socket.emit('login', {
					usernames: usernames
				});
				// echo globally (all clients) that a person has connected
				socket.broadcast.emit('user joined', {
					username: socket.username,
					numUsers: numUsers
				});
			});
			// when the client emits 'typing', we broadcast it to others
			socket.on('typing', function () {
				socket.broadcast.emit('typing', {
					username: socket.username
				});
			});
			// when the client emits 'stop typing', we broadcast it to others
			socket.on('stop typing', function () {
				socket.broadcast.emit('stop typing', {
					username: socket.username
				});
			});
			// when the user disconnects.. perform this
			socket.on('disconnect', function () {
				// remove the username from global usernames list
				if (addedUser) {
					usernames.remove(socket.username);
					--numUsers;
					// echo globally that this client has left
					socket.broadcast.emit('user left', {
						username: socket.username,
						numUsers: numUsers
					});
				}
			});
		});
	}
}