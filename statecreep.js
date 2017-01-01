var statecreep = {
  this_tick: function(s) {
    return {this_tick: true,
            next_state: s};
  },
  run: function(creep, mod) {
    var statef = mod.states;
    if(!creep.memory.state) {
      creep.memory.state = mod.defstate;
    }
    var f = statef[creep.memory.state];
    if(!f) {
      console.log(`Bad state ${creep.memory.state} for creep ${creep.name}`);
    } else {
      var ret = f(creep);
      var this_tick = false;
      if (ret instanceof Object && ret.this_tick) {
        ret = ret.next_state;
        this_tick = true;
      }
      if(statef[ret]) {
        console.log(`${creep.memory.role} ${creep.name}: ${creep.memory.state} -> ${ret}`);
        creep.memory.state = ret;
        creep.say(creep.memory.state);
      }
      if(this_tick) {
        //TAIL!?
        statecreep.run(creep, mod);
      }
    }
  }
};

module.exports = statecreep;
