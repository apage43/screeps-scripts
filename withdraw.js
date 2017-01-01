// Attempt to withdraw energy from containers or extensions, finally falling back on harvesting.
/** @param {Creep} creep **/
module.exports = function withdraw(creep, idleAt) {
  var targetcontainer = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (structure) => {
      if (structure.structureType == STRUCTURE_EXTENSION) {
        if (structure.energy > 0) {
          if (creep.room.memory.wantSpawn) {
            // do not harvest from extensions in rooms that want
            // to spawn something
            return false;
          }
          return true;
        }
      }
      if (structure.structureType == STRUCTURE_CONTAINER) {
        if(structure.store[RESOURCE_ENERGY] &&
           structure.store[RESOURCE_ENERGY] > 0)
           return true;
      }
      return false;
    }
  });
  if (targetcontainer) {
    if(!creep.pos.isNearTo(targetcontainer)) {
      creep.moveTo(targetcontainer);
      return;
    } else {
      creep.withdraw(targetcontainer, RESOURCE_ENERGY);
      return;
    }
  }
  if (creep.room.memory.wantSpawn) {
    // don't crowd out sources when we are in starvation mode
    if(idleAt) {
      creep.moveTo(idleAt)
    } else {
      creep.moveTo(Game.flags['Idlers'])
    }
    return;
  }
  var targetsource = creep.pos.findClosestByPath(FIND_SOURCES);
  if(creep.harvest(targetsource) == ERR_NOT_IN_RANGE) {
      creep.moveTo(targetsource);
  }
}
