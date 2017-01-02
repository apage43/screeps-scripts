var sm = require('statecreep');
var withdraw = require('withdraw');
var janitor = require('role.janitor');
var targetcache = require('targetcache');
var roleHarvester = {
  states: {
    /** @param {Creep} creep **/
    collecting: function (creep) {       
      if (creep.carry.energy < creep.carryCapacity) {
        var targetsource = targetcache(creep, 'targetsource', (creep) => creep.pos.findClosestByPath(FIND_SOURCES));
        if (!targetsource) {
          return 'janitorize';
        }
        let harvest = creep.harvest(targetsource);
        if (harvest == ERR_NOT_IN_RANGE) {
          let move = creep.moveTo(targetsource);
          if (move == ERR_NO_PATH) {
            return 'collect_target';
          }
        }
        if (harvest == ERR_NOT_ENOUGH_RESOURCES) {
          creep.drop(RESOURCE_ENERGY, creep.carry.energy);
          return 'janitorize';
        }
      } else {

        creep.drop(RESOURCE_ENERGY, creep.carry.energy);
      }
    },
    // Act as janitor if our source is empty
    janitorize: (creep) => {
      var targetsource = targetcache(creep, 'targetsource', (creep) => creep.pos.findClosestByPath(FIND_SOURCES));
      if (targetsource && targetsource.energy > 0) {
        return 'collecting';
      }
      sm.run(creep, janitor, 'janitor');
    }
  },
  defstate: 'collecting',

  /** @param {Creep} creep **/
  run: function (creep) {
    sm.run(creep, roleHarvester);
  }
};

module.exports = roleHarvester;
