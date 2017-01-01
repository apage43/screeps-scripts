var recall = require('recall').recall;

var roleMinimums = {
    'harvester': 10,
    'builder': 1,
    'upgrader': 2,
    'janitor': 1,
}
var rolePriority = ['defender', 'harvester', 'upgrader', 'builder', 'janitor']
var roles = {};

function design(role, spawn) {
    var body = [];
    var budget = spawn.room.energyCapacityAvailable;
    var move = 0;
    var weight = 0;
    var work = 0;
    var carry = 0;
    var attack = 0;
    var tough = 0;
    while (budget > 0) {
        if (move < weight / 2 || move == 0) {
            if (budget < 50) break;
            move += 1;
            budget -= 50;
            body.push(MOVE);
            continue;
        }
        // break conditions leave room for a MOVE
        if (roles[role].combat) {
            if (tough < attack * 2 || tough < 2) {
                if (budget < 60) break;
                tough += 1;
                budget -= 10;
                weight += 1;
                body.push(TOUGH);
                continue;
            }
            if (budget < 130) {
                break;
            }
            attack += 1;
            budget -= 80;
            weight += 1;
            body.push(ATTACK);
        }
        if (carry < work / 2 || carry == 0) {
            if (budget < 100) break;
            carry += 1;
            budget -= 50;
            weight += 1;
            body.push(CARRY);
            continue;
        }
        if (budget < 150) break;
        work += 1;
        budget -= 100;
        weight += 1;
        body.push(WORK);
        continue;
    }
    return body;
}

var bodyOverrides = {
    'upgrader': [MOVE, MOVE, WORK, WORK, WORK, CARRY],
    'janitor': [MOVE, MOVE, CARRY, CARRY, WORK]
}

for (var role of rolePriority) {
    roles[role] = require('role.' + role);
}

function spawnCreep(spawn, role) {
    var body = design(role, spawn);
    if (bodyOverrides[role]) {
        body = bodyOverrides[role];
    }
    var ret = spawn.createCreep(body, undefined, { role: role });
    if (ret < 0) {
        if (!spawn.room.memory.wantSpawn) {
            spawn.room.memory.wantSpawn = true;
            let bodydesc = _.chain(body)
             .groupBy()
             .map((v, k) => `${k}: ${v.length}`)
             .join(", ");
            console.log(`Want new ${role}: ${bodydesc}`);
        }
    } else {
        console.log('Spawned new ' + role + ': ' + ret);
        spawn.room.memory.wantSpawn = false;
    }
    return ret;
}

module.exports.loop = function () {

    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    var spawn = Game.spawns['Spawn1'];
    var hostiles = spawn.room.find(FIND_HOSTILE_CREEPS, {
        filter: (creep) => {
            return true;
        }
    });

    var constructions = spawn.room.find(FIND_CONSTRUCTION_SITES);
    var needed_constr_progress = _.chain(constructions)
        .map((site) => {
            return site.progressTotal - site.progress;
        })
        .sum()
        .value();
    var extraBuilders = Math.ceil(needed_constr_progress / 1000.0);
    if (extraBuilders > 0 && spawn.memory.lastExtraBuilders != extraBuilders) {
        console.log(`Retaining ${extraBuilders} extra builders to complete ${needed_constr_progress} points of construction.`);
    }
    spawn.memory.lastExtraBuilders = extraBuilders;

    var roleCounts = _.clone(roleMinimums);
    roleCounts['defender'] = hostiles.length;
    roleCounts['builder'] += extraBuilders;

    var creepsByRole = _.groupBy(Game.creeps, (creep) => creep.memory.role);


    //spawn.room.memory.wantSpawn = false;
    for (var roleindex in rolePriority) {
        var role = rolePriority[roleindex];
        var targetCount = roleCounts[role];
        var creeps = creepsByRole[role];
        var n = 0;
        if (creeps) n = creeps.length;
        if (n < targetCount) {
            spawnCreep(spawn, role);
            break;
        }
    }


    var counts = {};
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role) {
            var role = creep.memory.role;
            if (counts[role] == undefined) {
                counts[role] = 0;
            }
            if (counts[role] >= roleCounts[role] && roles[role].recallable) {
                recall(creep);
                continue;
            }
            roles[creep.memory.role].run(creep);
            counts[role]++;
        } else {
            console.log("Weird typed creep: " + creep);
        }
    }

    if (Game.time % 25 == 0) {
        let report = _.chain(counts)
             .map((v, k) => `${k}: ${v}`)
             .join(", ");
        let wanted = _.chain(roleCounts)
             .map((v, k) => `${k}: ${v}`)
             .join(", ");
        console.log(`Creep roles at tick ${Game.time}: ${report}`);
        console.log(`Creeps wanted: ${wanted}`);
    }

}
