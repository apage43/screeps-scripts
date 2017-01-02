var targetcache = function (creep, tkey, targetfunc) {
    let tid = creep.memory[tkey];
    if (!tid) {
        let tobj = targetfunc(creep);
        if (tobj) {
            let tid = tobj.id;
            creep.memory[tkey] = tid;
            return tobj;
        }
    } else {
        let tobj = Game.getObjectById(tid);
        if (!tobj) {
            let tobj = targetfunc(creep);
            if (tobj) {
                let tid = tobj.id;
                creep.memory[tkey] = tid;
                return tobj;
            }
        } else {
            return tobj;
        }
    }
}

module.exports = targetcache;