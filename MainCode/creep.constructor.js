var creep_constructor = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.building && creep.carry.energy == 0) {
            delete creep.memory.building;
        } else if ( _.sum(creep.carry) == creep.carryCapacity && !creep.memory.building) {
            creep.memory.building = true;
        }

        if (!creep.memory.building) {
            if (creep.room.name != creep.memory.targetRoom) {
                creep.moveTo(new RoomPosition(28, 48, creep.memory.targetRoom));
            } else {
                if (creep.harvest(Game.getObjectById('57ef9dba86f108ae6e60e2f8')) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById('57ef9dba86f108ae6e60e2f8'));
                }
            }
        } else {
            if (creep.room.name != creep.memory.targetRoom) {
                creep.moveTo(new RoomPosition(28, 48, creep.memory.targetRoom));
            } else {
                if (creep.carry.energy <= 20) {
                    //Upgrade the controller
                    if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller);
                    }
                }
                if (creep.build(Game.getObjectById(creep.memory.siteID)) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.siteID));
                }
            }
        }
    }
};

module.exports = creep_constructor;