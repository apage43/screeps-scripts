var withdraw = require('withdraw');
var sm = require('statecreep');
var roleUpgrader = {
    states: {
      harvesting: function(creep) {
        withdraw(creep, creep.room.controller);
        if(creep.carry.energy == creep.carryCapacity) {
          return 'upgrading';
        }
      },
      upgrading: function(creep) {
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
        }
        if(creep.carry.energy == 0) {
          return 'harvesting';
        }
      }
    },
    defstate: 'harvesting',
    /** @param {Creep} creep **/
    run: function(creep) {
      sm.run(creep, roleUpgrader);
    }
};

module.exports = roleUpgrader;
