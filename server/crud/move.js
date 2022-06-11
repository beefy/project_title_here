const db = require('./db').get_db();
const crud_login = require('./login');
const crud_terrain = require('./terrain');

module.exports = {
    set_posture,
    get_vibe,
    move
};

async function set_posture(socket, posture) {
    // TODO: is it possible to do this in one query?
    await crud_login.get_user(socket.id).catch(console.dir).then( (user) => {

        if(user['posture'] === posture) {
            socket.send({data: "You are already " + posture});
        }

        var energy_regen = 0;
        if(user['posture'] !== 'standing' && user['energy'] < 1) {
            // captured in milliseconds
            var time_in_posture = new Date() - user["last_set_posture_ts"]
            var regen_multiplier = {
                "sitting": 1,
                "laying": 2
            }[user['posture']]
            // 20 seconds of sitting or 10 seconds of laying to get
            // to full energy
            energy_regen = time_in_posture * 0.00005 * regen_multiplier;
            if(energy_regen + user['energy'] > 1) {
                energy_regen = 1 - user['energy'];
            }
            socket.send(
                {data: "Energy increased by " + 
                Math.round(energy_regen * 100) +
                "% after " + user['posture'] + " for " + 
                parseFloat(time_in_posture/1000).toFixed(1) + " seconds"});
        }

        db.collection('user').updateOne({
            socket_id: socket.id
        }, {
            $set: {
                posture: posture,
                last_cmd_ts: new Date(),
                last_set_posture_ts: new Date(),
            }, $inc: {
                energy: energy_regen
            }
        });
    });
}

async function get_vibe(socket_id) {
    return await db.collection('user').findOne({
        socket_id: socket_id
    }, {
        age: 1, tall: 1, weight: 1,
        posture: 1, angle: 1, lat: 1, long: 1, height: 1,
        energy: 1
    })
}

async function move(socket, distance, turn) {
    // convert distance to lat/long degrees
    var move_distance = (Math.PI/300)*distance
    await crud_login.get_user(socket.id).catch(console.dir).then( (user) => {
        var movement_energy = 0.025 * Math.pow(distance, 2);

        if(user['posture'] === "laying" && turn !== 0) {
            socket.send({data: "You cannot turn around while laying down. Sit or stand up first!"});
            return;
        }

        if(user['energy'] < movement_energy && distance !== 0) {
            socket.send({data: "Not enough energy! Sit or lay down to rest"})
            return;
        }

        if(user['posture'] !== "standing" && distance !== 0) {
            socket.send({data: "Cannot move while " + user['posture'] + '. Stand up first!'})
            return;
        }

        var new_angle = (user["angle"] + turn) % (2 * Math.PI);
        var new_lat = (user["lat"] + move_distance * Math.cos(user["angle"] + turn)) % (2 * Math.PI);
        var new_long = (user["long"] + move_distance * Math.sin(user["angle"] + turn)) % (2 * Math.PI);

        db.collection('user').updateOne({
            socket_id: socket.id
        }, {
            $set: {
                angle: new_angle,
                lat: new_lat,
                long: new_long,
                last_cmd_ts: new Date(),
                energy: user["energy"] - movement_energy
            }
        }).then( () => {
            crud_terrain.check_biomes(socket, new_angle, new_lat, new_long);
        })
    });
}
