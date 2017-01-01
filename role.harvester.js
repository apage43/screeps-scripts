var sm = require('statecreep');
var withdraw = require('withdraw');
var roleHarvester = {
  states: {
    /** @param {Creep} creep **/
    collecting: function (creep) {
      if (creep.carry.energy < creep.carryCapacity) {
        var targetsource = creep.pos.findClosestByPath(FIND_SOURCES, {
          filter: (source) => {
            // seek out sources that have energy or will have it soon
            return (source.energy > 0 || source.ticksToRegeneration <= 30)
          }
        });
        // if we are trying to spawn stuff and no accessible sources have energy,
        // cannibalize our containers
        if (!targetsource && creep.room.memory.wantSpawn) {
          creep.say('starved');
          withdraw(creep);
          return;
        }
        if (_.includes([ERR_NOT_IN_RANGE, ERR_NOT_ENOUGH_RESOURCES],
          creep.harvest(targetsource))) {
          creep.moveTo(targetsource);
        }
      } else {
        return 'depositing';
      }
    },
    /** @param {Creep} creep **/
    depositing: function (creep) {
      var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
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
      });
      if (target) {
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
        }
      }
      if (creep.carry.energy == 0) {
        return 'collecting';
      }
    }
  },
  defstate: 'collecting',

  /** @param {Creep} creep **/
  run: function (creep) {
    sm.run(creep, roleHarvester);
  }
};

module.exports = roleHarvester;
