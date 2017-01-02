var statecreep = {
  this_tick: function (s) {
    return {
      this_tick: true,
      next_state: s
    };
  },
  run: function (creep, mod, submachine) {
    var this_tick;
    var newstate = false;
    var statekey;
    if (submachine) {
      statekey = `${submachine}_state`;
    } else {
      statekey = 'state';
    }
    do {
      this_tick = false;
      var statef = mod.states;
      if (!creep.memory[statekey]) {
        creep.memory[statekey] = mod.defstate;
      }
      var f = statef[creep.memory[statekey]];
      if (!f) {
        console.log(`Bad state ${creep.memory[statekey]} for creep ${creep.name}, resetting.`);
        this_tick = true;
        creep.memory[statekey] = mod.defstate;
      } else {
        var ret = f(creep);
        if (ret instanceof Object && ret.this_tick) {
          ret = ret.next_state;
          this_tick = true;
        }
        if (statef[ret]) {
          //console.log(`${creep.memory.role} ${creep.name}: ${creep.memory[statekey]} -> ${ret}`);
          creep.memory[statekey] = ret;
          newstate = true;
          
        }
      }
    } while (this_tick);
    if(newstate) creep.say(creep.memory[statekey]);
  }
};

module.exports = statecreep;
