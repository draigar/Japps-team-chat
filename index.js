var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = {};
app.get('/', function(req, res){
   res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  //console.log('a user with socket: '+ socket.id +' connected');

  socket.on('new-user', function(data, callback){
  	if (data in users){
  		callback(false);
  	}else{
  		callback(true);
	  	socket.usernames = data;
	  	users[socket.usernames] = socket.id;
	  	update();
  	}
  });

  function update(){
  	io.emit('usernames', Object.keys(users));
  }
 socket.on('chat message', function(data){
    io.emit('chat message', {msg: data, nick: socket.usernames});
  });

 socket.on('private_message', function(sent){
 	var space = sent.indexOf(' ');
 	var name = sent.substr(0, space);
 	var data = sent.substr(space+1);
 	io.to(users[socket.usernames]).emit('chat message', {msg: data, nick: socket.usernames});
 	io.to(users[name]).emit('chat message', {msg: data, nick: socket.usernames});
 	
 });

  socket.on('disconnect', function(){
  //console.log('a user with socket: '+ socket.id +' disconnected');
  if(!socket.usernames) return;
   delete users[socket.usernames];
 update();
  });
  
});

app.set('port',(process.env.PORT || 5000));

app.listen(app.get('port'),function(){
    console.log("Listening on http://127.0.0.1:3000");
});
