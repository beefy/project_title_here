const announce = require('../announce');
const crud_move = require('../crud/move');
var seeing_distance = 3;

module.exports = {
    add_routes
}

function add_routes(socket, io) {

    // turning left

    socket.on('turn slight left', function(data) {
        crud_move.move(socket, 0, Math.PI/6, 'turn', false);
        announce.announce(socket.id, io, 'turned slight left', seeing_distance, true);
    });

    socket.on('turn left', function(data) {
        crud_move.move(socket, 0, Math.PI/3, 'turn', false);
        announce.announce(socket.id, io, 'turned left', seeing_distance, true);
    });

    socket.on('turn hard left', function(data) {
        crud_move.move(socket, 0, Math.PI/2, 'turn', false);
        announce.announce(socket.id, io, 'turned hard left', seeing_distance, true);
    });

    socket.on('turn a little to the left', function(data) {
        crud_move.move(socket, 0, Math.PI/6 * Math.random(), 'turn', false);
        announce.announce(socket.id, io, 'turned a bit to the left', seeing_distance, true);

    });

    // turning right

    socket.on('turn slight right', function(data) {
        crud_move.move(socket, 0, Math.PI/6 * -1, 'turn', false);
        announce.announce(socket.id, io, 'turned slight right', seeing_distance, true);
    });

    socket.on('turn right', function(data) {
        crud_move.move(socket, 0, Math.PI/3 * -1, 'turn', false);
        announce.announce(socket.id, io, 'turned right', seeing_distance, true);
    });

    socket.on('turn hard right', function(data) {
        crud_move.move(socket, 0, Math.PI/2 * -1, 'turn', false);
        announce.announce(socket.id, io, 'turned hard right', seeing_distance, true);
    });

    socket.on('turn around', function(data) {
        crud_move.move(socket, 0, Math.PI, 'turn', false);
        announce.announce(socket.id, io, 'turned around', seeing_distance, true);
    });

    socket.on('turn a little to the right', function(data) {
        crud_move.move(socket, 0, Math.PI/6 * Math.random() * -1, 'turn', false);
        announce.announce(socket.id, io, 'turned a bit to the right', seeing_distance, true);
    });

    // face a cardinal direction

    socket.on('turn to face north', function(data) {
        crud_move.move(socket, 0, Math.PI/2, 'turn', true);
        announce.announce(socket.id, io, 'turned to face north', seeing_distance, true);
    });

    socket.on('turn to face south', function(data) {
        crud_move.move(socket, 0, Math.PI*1.5, 'turn', true);
        announce.announce(socket.id, io, 'turned to face south', seeing_distance, true);
    });

    socket.on('turn to face east', function(data) {
        crud_move.move(socket, 0, 0, 'turn', true);
        announce.announce(socket.id, io, 'turned to face east', seeing_distance, true);
    });

    socket.on('turn to face west', function(data) {
        crud_move.move(socket, 0, Math.PI, 'turn', true);
        announce.announce(socket.id, io, 'turned to face west', seeing_distance, true);
    });
}