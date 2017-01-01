var recallMod = {

    /** @param {Creep} creep **/
    recall: function(creep) {
      var spawn = Game.spawns['Spawn1'];
      if (!creep.memory.recalling) {
        creep.memory.recalling = true;
        console.log(`Recalling ${creep.memory.role} ${creep.name}`);
      }
      if (creep.pos.isNearTo(spawn)) {
        spawn.recycleCreep(creep);
      } else {
        creep.moveTo(spawn);
      }
    }
}

module.exports = recallMod;
