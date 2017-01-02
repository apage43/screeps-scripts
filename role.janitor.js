// Collect dropped energy, move to things that hold energy;
var sm = require('statecreep');
var targetcache = require('targetcache');
var janitor = {
  states: {
    decide: function (creep) {
      var carrying = _.sum(creep.carry);
      if (carrying < creep.carryCapacity) {
        return sm.this_tick('scavenge');
      }
      if (carrying == creep.carryCapacity) {
        return sm.this_tick('depositing');
      }
    },
    scavenge: function (creep) {
      var target = targetcache(creep, 'scavenge_target', (creep) => {
        return creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
      });
      var carrying = _.sum(creep.carry);
      if (carrying == creep.carryCapacity) {
        return sm.this_tick('depositing');
      }
      if (target) {    
        let pickup = creep.pickup(target);
        if (pickup == OK) {
          creep.say("picked up");
          return 'decide';
        }
        if (pickup == ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
          return;
        }
      } else {
        delete creep.memory.scavenge_target;
        if (carrying > 0) {
          return sm.this_tick('depositing');
        }
      }
    },
    depositing: function (creep) {
      var target = targetcache(creep, 'deposit_target', (creep) => {
        return creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: (structure) => {
            if ((structure.structureType == STRUCTURE_EXTENSION ||
              structure.structureType == STRUCTURE_SPAWN ||
              structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity) {
              return true;
            }
            // skip containers if we are trying to spawn units
            if (structure.structureType == STRUCTURE_CONTAINER &&
              !creep.room.memory.wantSpawn &&
              _.sum(structure.store) < structure.storeCapacity) {
              return true;
            }
          }
        })
      });
      if (target) {
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
        }
      }
      if (creep.carry.energy == 0) {
        return sm.this_tick('decide');
      }
      // retarget it if our target has filled up or gone away
      if (!target ||
        (target.energy && target.energy == target.energyCapacity) ||
        (target.store && _.sum(target.store) == target.storeCapacity)) {
        delete creep.memory.deposit_target;
      }
    },
  },
  defstate: 'decide',
  run: function (creep) {
    sm.run(creep, janitor);
  }
}

module.exports = janitor;
