// Collect dropped things, move to containers;
var sm = require('statecreep');
var janitor = {
  states: {
    decide: function (creep) {
      var carrying = _.sum(creep.carry);
      if (carrying < creep.carryCapacity) {
        return sm.this_tick('find');
      }
      if (carrying == creep.carryCapacity) {
        return sm.this_tick('deposit');
      }
      creep.moveTo(Game.flags['Idlers']);
    },
    find: function (creep) {
      var target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
      var carrying = _.sum(creep.carry);
      if (target) {
        creep.moveTo(target);
        if (creep.pickup(target) == OK) {
          creep.say("picked up");
          return 'decide';
        };
      } else {
        if (carrying == 0) {
          creep.moveTo(Game.flags['Idlers']);
        } else {
          return 'deposit';
        }
      }
    },
    deposit: function (creep) {
      var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => {
          if (structure.structureType == STRUCTURE_CONTAINER &&
            _.sum(structure.store) < structure.storeCapacity) {
            return true;
          }
        }
      });
      var sending = true;
      for (type in creep.carry) {
        if (creep.transfer(target, type) == ERR_NOT_IN_RANGE) {
          sending = false;
        }
      }
      if (!sending) {
        creep.moveTo(target);
      }
      var carrying = _.sum(creep.carry);
      if (carrying == 0) {
        return 'decide';
      }
    }
  },
  defstate: 'decide',
  run: function (creep) {
    sm.run(creep, janitor);
  }
}

module.exports = janitor;
