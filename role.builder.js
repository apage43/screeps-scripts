var withdraw = require('withdraw');
var sm = require('statecreep');

function repair(creep, thresh = 1.0) {
    // if nothing to build, repair stuff.
    var targets = creep.room.find(FIND_STRUCTURES, {
        filter: object => object.hits < (object.hitsMax * thresh)
    });

    targets.sort((a, b) => a.hits - b.hits);

    if (targets.length > 0) {
        if (creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0]);
            return true;
        } else {
            return true;
        }
    }
    return false;
}

var roleBuilder = {
    /** @param {Creep} creep **/
    states: {
        charging: (creep) => {
            withdraw(creep);
            if (creep.carry.energy == creep.carryCapacity)
                return sm.this_tick('targeting');
        },
        targeting: (creep) => {
            if (Game.flags['build_now']) {
                let flag = Game.flags['build_now'];
                if (creep.room == flag.room) {
                    var sites = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, flag);
                    if (sites.length > 0) {
                        var target = sites[0];
                        creep.memory.build_target = target.id;
                        return sm.this_tick('building');
                    }
                }
            }
            if (creep.carry.energy == 0) {
                return sm.this_tick('charging');
            }
            var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if (target) {
                creep.memory.build_target = target.id;
                return sm.this_tick('building');
            } else {
                return sm.this_tick('repairing');
            }
        },
        building: (creep) => {
            var target = Game.getObjectById(creep.memory.build_target);
            if (target) {
                if (creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            } else {
                return sm.this_tick('targeting');
            }
            if (creep.carry.energy == 0) {
                return 'charging';
            }
        },
        repairing: (creep) => {
            repair(creep, 0.5) || repair(creep, 1.0);
            if (creep.carry.energy == 0) {
                return sm.this_tick('charging');
            }
        }
    },
    defstate: 'charging',
    run: function (creep) {
        sm.run(creep, roleBuilder);
    }
};

module.exports = roleBuilder;
