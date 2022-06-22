const crud_user_basic = require('../user/basic');
const crud_connection = require('../user/connection');
const proximity = require('./proximity');
const crud_attack = require('./attack');
const crud_terrain = require('../terrain')
const config = require("../../config");

module.exports = {
    announce,
    attack_nearby,
    look_around
}

function announce(socket_id, io, message, distance, check_behind) {
    // get sockets of the close players
    crud_user_basic.get_user(socket_id).catch(console.dir).then( (user) => {
        crud_connection.get_other_connections(
            socket_id, user["lat"], user["long"], config.ONE_METER*distance
        ).catch(console.dir).then( (other_users) => {
            // send the message to the socket of each close player
            other_users.forEach( (other_user) => {
                // check if "other_user" can see "user"
                var perspective = proximity.get_perspective(
                    user, other_user, config.ONE_METER*distance, check_behind
                );
                if(perspective) {
                    io.to(other_user["socket_id"]).emit('message', {
                        // TODO: 'You *hear/see* the player to your left etc etc'
                        // instead of just 'the player to your left etc etc
                        data: 'The human ' + perspective + ' ' + message
                    });
                }
            });
        });
    });
}

function attack_nearby(socket, io, distance, energy, damage, check_behind) {
    // TODO: generalize for attacks other than punching
    // TODO: filter out players that are logged off / idle for a long time
    // get sockets of the close players
    crud_user_basic.get_user(socket.id).catch(console.dir).then( (user) => {

        if(user['energy'] < energy) {
            socket.send({data: "You don't have enough energy to punch! Sit or lay down to reset"});
            return;
        }

        crud_connection.get_other_connections(
            socket.id, user["lat"], user["long"], config.ONE_METER*distance
        ).catch(console.dir).then( (other_users) => {
            // send the message to the socket of each close player
            var punched = false;
            return other_users.forEach( (other_user) => {
                // check if "user" can see "other_user"
                var perspective = proximity.get_perspective(
                    other_user, user, config.ONE_METER*distance, check_behind
                );
                if(perspective) {
                    crud_attack.perform_attack(socket, io, user, other_user, damage, energy, perspective);
                    punched = true;
                    return;
                }
            }).then( () => {
                if(!punched) {
                    announce(socket.id, io, 'punched thin air', config.SEEING_DISTANCE, false);
                    socket.send({data: 'You missed'});
                    return;
                }
            });
        });
    });
}

function look_around(socket_id, io) {
    
    crud_user_basic.get_user(socket_id).catch(console.dir).then( (user) => {
        // display biomes nearby
        crud_terrain.check_biomes(socket_id, io, user["angle"], user["lat"], user["long"]);

        // display other players nearby
        crud_connection.get_other_connections(
            socket_id, user["lat"], user["long"], config.ONE_METER*config.SEEING_DISTANCE
        ).catch(console.dir).then( (other_users) => {
            other_users.forEach( (other_user) => {
                // check if "user" can see "other_user"
                var perspective = proximity.get_perspective(
                    other_user, user, config.ONE_METER*config.SEEING_DISTANCE, true
                );
                if(perspective) {
                    io.to(socket_id).emit('message', {
                        data: 'You see a ' + other_user['tall'] + ' ' + other_user['weight'] + 
                        ' ' + other_user['age'] + ' human ' +  perspective
                    });
                }
            })
        });

        // display corpses nearby
    });
}
