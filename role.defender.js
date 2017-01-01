var sm = require('statecreep');
var defender = {
    combat: true,
    recallable: true,
    states: {
        target: function(creep) {
            var target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
            if(target) {
                creep.memory.target = target.id;
                return sm.this_tick('kill');
            }
        },
        kill: function(creep) {
            var target = Game.getObjectById(creep.memory.target);
            if (target) {
                if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            } else {
                delete creep.memory.target;
                return 'target';
            }
        },
    },
    defstate: 'target',
    run: function(creep) {
        sm.run(creep, defender);
    }
};

module.exports = defender;