var creep_constructor = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.building && creep.carry.energy == 0) {
            delete creep.memory.building;
        } else if (_.sum(creep.carry) == creep.carryCapacity && !creep.memory.building) {
            creep.memory.building = true;
        }

        if (!creep.memory.building) {
            if (creep.room.name != creep.memory.destination) {
                var thisPortal = undefined;
                if (Game.flags["TakePortal"] && Game.flags["TakePortal"].pos.roomName == creep.pos.roomName) {
                    var thisPortal = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => (structure.structureType == STRUCTURE_PORTAL)
                    });
                }
                if (thisPortal) {
                    if (creep.memory.path.length && creep.memory.path[0] == creep.room.name) {
                        creep.memory.path.splice(0, 1);
                    }
                    creep.moveTo(thisPortal)
                } else if (creep.memory.path) {
                    if (creep.memory.path[0] == creep.room.name) {
                        creep.memory.path.splice(0, 1);
                    }
                    creep.moveTo(new RoomPosition(25, 25, creep.memory.path[0]));
                } else {
                    creep.moveTo(new RoomPosition(25, 25, creep.memory.destination));
                }
            } else {

                var sources = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
                if (sources) {
                    if (creep.pickup(sources) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(sources, {
                            reusePath: 25
                        });
                    }
                } else {
                    sources = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
                    if (sources) {
                        if (creep.harvest(sources) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(sources);
                        }
                    }
                }

            }
        } else {
            if ((creep.carry.energy <= 20 && creep.hits < 2500 && creep.room.controller.level < 2)) {
                //Upgrade the controller
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            } else if (creep.build(Game.getObjectById(creep.memory.siteID)) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.siteID));
            } else if (creep.build(Game.getObjectById(creep.memory.siteID)) == ERR_INVALID_TARGET) {
                if (Game.flags["BuildThis"]) {
                    Game.flags["BuildThis"].remove();
                }
                creep.memory.priority = 'harvester';
                creep.memory.priority = 'helper';
                if (creep.memory.homeRoom && !Game.flags[creep.memory.homeRoom + "SendHelper"]) {
                    creep.pos.createFlag(creep.memory.homeRoom + "SendHelper");
                }
            }
        }
    }
};

module.exports = creep_constructor;
