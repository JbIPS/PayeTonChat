package server;

import js.Node;
import js.npm.Express;
import js.npm.express.Static;
import js.npm.mongoose.Mongoose;
import js.npm.Mongoose.mongoose;
import js.npm.socketio.Socket;
import js.support.DynamicObject;

import server.ChatHistory;

using Lambda;

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

      // connect
    var db: Mongoose = mongoose.connect("mongodb://localhost:27017/");
    // var db: Mongoose = mongoose.connect("mongodb://ptc-log:pwdlog04@ds037551.mongolab.com:37551/heroku_app34822743");
    var history = ChatHistoryManager.build(db, "ChatHistory");

    var port = untyped (process.env.PORT || 3000);

    server.listen(port, function () {
      trace('Server listening at port '+port);
    });

    // Routing
    app.use(new Static( Node.__dirname + "/public" ));
    // Chatroom
    // usernames which are currently connected to the chat
    var usernames = new Array<String>();
    var numUsers = 0;
    var whisperRegExp = ~/^@(.+)?: /;

    io.on('connection', function (socket: Socket) {
      var addedUser = false;
      // when the client emits 'new message', this listens and executes
      socket.on('new message', function (data) {
        // we tell the client to execute 'new message'
        trace("New msg from "+socket.username+": "+data);
        var user: String = socket.username;
        var target: String = null;
        if(whisperRegExp.match(data)){
          target = usernames.find(function(user: String) return user.toLowerCase() == whisperRegExp.matched(1).toLowerCase());
          trace("match! "+whisperRegExp.matched(1));
          trace("users: "+usernames);
          socket.to(target).emit('new message', {
            username: user,
            message: data
          });
        }
        else
          socket.broadcast.emit('new message', {
            username: user,
            message: data
          });

        // TODO Ask for user
        if(user != null){
          history.create({username: user, message: data, whisperTarget: target}, function(err, doc){
            if(err != null)
              trace("Can't save chat history: "+err);
          });
        }
        else
          trace("User is null for message: "+data);
      });

      socket.on("new action", function(action: String){
        socket.broadcast.emit("new action", action);
      });

      // when the client emits 'add user', this listens and executes
      socket.on('add user', function (username) {
        // we store the username in the socket session for this client
        socket.username = username;
        socket.join(username);
        // add the client's username to the global list
        if(usernames.indexOf(username) == -1){
          usernames.push(username);
          ++numUsers;
          addedUser = true;
        }
        else{
          trace("Already taken username "+username);
        }
        history.find({}, function(err, results){
          if(err != null)
            trace("Can't get chat history: "+err);
          else{
            //trace("Result: "+results);
            //trace("Result (0-50): "+results.slice(-50));
            socket.emit('login', {
              usernames: usernames,
              history: results.filter(function(h: ChatHistory) return h.whisperTarget == null || (h.whisperTarget == username || h.username == username)).slice(-50)
            });
          }
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
          username: socket.username != null ? socket.username : "unknown"
        });
      });
      // when the client emits 'stop typing', we broadcast it to others
      socket.on('stop typing', function () {
        socket.broadcast.emit('stop typing', {
          username: socket.username != null ? socket.username : "unknown"
        });
      });
      // when the user disconnects.. perform this
      socket.on('disconnect', function () {
        // remove the username from global usernames list
        trace("Disconnect: "+socket.username+". Added user ? "+addedUser);
        usernames.remove(socket.username);
        --numUsers;
        // echo globally that this client has left
        socket.broadcast.emit('user left', {
          username: socket.username,
          numUsers: numUsers
        });
      });
      socket.on('socket reconnect', function(username: String, cb: Void->Void){
        trace("Reconnect: "+username);
        if(username != null){
          socket.username = username;
          usernames.push(username);
          cb();
        }
      });
    });
  }
}
