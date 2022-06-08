const express = require('express')
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const cors = require("cors");
const crud = require('./crud');
const login = require('./login');
const path = require('path');
const announce = require('./announce');
// app.use(cors());
app.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Methods','Content-Type','Authorization');
  cors();
  next(); 
})
var walk_speed = 1
var run_speed = 2
var hearing_distance = 10;
var seeing_distance = 10;

app.use(express.static(path.join(__dirname, 'client')));

io.on('connection', function (socket){
  console.log('new connection: ' + socket.id);

  socket.on('login', function(data) {
    login.login(data, socket);
  });
  
  socket.on('exit', function (data) {
    socket.send({data: "bye"});
    socket.close();
  });

  socket.on('disconnect', function(event) {
    crud.delete_connection(socket.id).catch(console.dir);
  });

  socket.on('say', function(data) {
    announce.announce(socket.id, io, data['msg'], hearing_distance, false);
  });
  
  socket.on('walk forward', function (data) {
    crud.move(socket.id, walk_speed, 0);
    announce.announce(socket.id, io, 'walked forward', seeing_distance, true);
  });

  socket.on('walk left', function (data) {
    crud.move(socket.id, walk_speed, Math.PI/2);
    announce.announce(socket.id, io, 'walked left', seeing_distance, true);
  });

  socket.on('walk right', function(data) {
    crud.move(socket.id, walk_speed, Math.PI/2 * -1);
    announce.announce(socket.id, io, 'walked right', seeing_distance, true);
  });

  socket.on('run forward', function (data) {
    crud.move(socket.id, run_speed, 0);
    announce.announce(socket.id, io, 'ran forward', seeing_distance, true);
  });

  socket.on('run left', function (data) {
    crud.move(socket.id, run_speed, Math.PI/2);
    announce.announce(socket.id, io, 'ran left', seeing_distance, true);
  });

  socket.on('run right', function(data) {
    crud.move(socket.id, run_speed, Math.PI/2 * -1);
    announce.announce(socket.id, io, 'ran right', seeing_distance, true);
  });

  socket.on('turn left', function(data) {
    crud.move(socket.id, 0, Math.PI/2);
    announce.announce(socket.id, io, 'turned left', seeing_distance, true);
  });

  socket.on('turn right', function(data) {
    crud.move(socket.id, 0, Math.PI/2 * -1);
    announce.announce(socket.id, io, 'turned right', seeing_distance, true);
  });

  socket.on('turn around', function(data) {
    crud.move(socket.id, 0, Math.PI);
    announce.announce(socket.id, io, 'turned around', seeing_distance, true);
  });

  socket.on('sit down', function(data) {
    crud.set_posture(socket.id, 'sitting');
    announce.announce(socket.id, io, 'sat down', seeing_distance, true)
  })

  socket.on('lay down', function(data) {
    crud.set_posture(socket.id, 'laying');
    announce.announce(socket.id, io, 'layed down', seeing_distance, true)
  })

  socket.on('stand up', function(data) {
    crud.set_posture(socket.id, 'standing');
    announce.announce(socket.id, io, 'stood up', seeing_distance, true)
  })
  
  socket.on('look', function(data) {
    crud.get_user(socket.id).catch(console.dir).then( (user) => {
      crud.get_biome(user["x"], user["y"]).catch(console.dir).then( (biome) => {
        if(biome === null) {
          // todo: generate another chunk of world
        } else {
          socket.send({data: biome['type']});
        }
      });
    })
  })
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});
