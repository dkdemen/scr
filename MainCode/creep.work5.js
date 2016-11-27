var creep_work5 = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.priority == 'miner') {
            if (_.sum(creep.carry) < creep.carryCapacity) {
                var savedTarget = Game.getObjectById(creep.memory.mineSource);
                if (savedTarget) {
                    if (creep.harvest(savedTarget) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(savedTarget);
                    } else if (creep.harvest(savedTarget, RESOURCE_ENERGY) == ERR_NOT_ENOUGH_RESOURCES && _.sum(creep.carry) > 0) {
                        //Source is dry, store what you have.
                        var savedTarget2 = Game.getObjectById(linkSource);
                        if (savedTarget2) {
                            if (creep.transfer(savedTarget2, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(targets);
                            }
                        }
                    }
                }
            } else if (_.sum(creep.carry) == creep.carryCapacity) {
                var savedTarget = Game.getObjectById(linkSource);
                if (savedTarget) {
                    if (creep.transfer(savedTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        //This should never actually fire, if ideal.
                        creep.moveTo(targets);
                    }
                }
            }
        } else if (creep.memory.priority == 'upgrader') {
            if (_.sum(creep.carry) == 0) {
                var linkTarget = Game.getObjectById(creep.memory.linkSource);
                if (linkTarget) {
                    if (linkTarget.energy >= 300) {
                        if (creep.withdraw(linkTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(linkTarget);
                        }
                    } else {
                        //Get from storage instead
                        var storageTarget = Game.getobjectById(creep.memory.storageSource);
                        if (storageTarget) {
                            if (storageTarget.store[RESOURCE_ENERGY] >= 300) {
                                if (creep.withdraw(storageTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(storageTarget);
                                }
                            }
                        }
                    }
                } else {
                    var storageTarget = Game.getobjectById(creep.memory.storageSource);
                    if (storageTarget) {
                        if (storageTarget.store[RESOURCE_ENERGY] >= 300) {
                            if (creep.withdraw(storageTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(storageTarget);
                            }
                        }
                    }
                }
            } else if (_.sum(creep.carry) > 0) {
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            }
        } else if (creep.memory.priority == 'mule') {
            if (_.sum(creep.carry) == 0) {
                var storageTarget = Game.getObjectById(creep.memory.storageSource);
                if (storageTarget) {
                    if (storageTarget.store[RESOURCE_ENERGY] > 0) {
                        //Get from container
                        creep.memory.structureTarget = targets.id;
                        if (creep.withdraw(targets, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(targets);
                        }
                    }
                }
            } else if (_.sum(creep.carry) > 0) {
                var savedTarget = Game.getObjectById(creep.memory.structureTarget)

                if (savedTarget) {
                    if (creep.build(savedTarget) == ERR_INVALID_TARGET) {
                        if (savedTarget.structureType != STRUCTURE_CONTAINER && savedTarget.structureType != STRUCTURE_STORAGE && savedTarget.structureType != STRUCTURE_CONTROLLER) {
                            //Storing in spawn/extension/tower
                            if (creep.transfer(savedTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(savedTarget);
                            }
                            if (savedTarget.energy == savedTarget.energyCapacity) {
                                creep.memory.structureTarget = undefined;
                            }
                        } else if (savedTarget.structureType == STRUCTURE_CONTAINER || savedTarget.structureType == STRUCTURE_STORAGE) {
                            //Storing in storage
                            if (creep.transfer(savedTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(savedTarget);
                            }
                            if (savedTarget.store[RESOURCE_ENERGY] == savedTarget.storeCapacity) {
                                creep.memory.structureTarget = undefined;
                            }
                        } else {
                            //Upgrading controller
                            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(creep.room.controller);
                            }
                        }
                    } else {
                        if (creep.build(savedTarget) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(savedTarget);
                        }
                    }
                } else {
                    var targets = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
                        }
                    });
                    if (targets) {
                        creep.memory.structureTarget = targets.id;
                        if (creep.transfer(targets, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(targets);
                        }
                        if (targets.energy == targets.energyCapacity) {
                            //If container fills up on this tick, forget it.
                            creep.memory.structureTarget = undefined;
                        }
                    } else {
                        targets3 = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                            }
                        });
                        if (targets3) {
                            creep.memory.structureTarget = targets3.id;
                            if (creep.transfer(targets3, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(targets3);
                            }
                            if (targets3.energy == targets3.energyCapacity) {
                                //If container fills up on this tick, forget it.
                                creep.memory.structureTarget = undefined;
                            }
                        } else {
                            //Containers call a different function to check contents
                            var containers = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                                filter: (structure) => {
                                    return (structure.structureType == STRUCTURE_CONTAINER ||
                                        structure.structureType == STRUCTURE_STORAGE) && structure.store[RESOURCE_ENERGY] < structure.storeCapacity;
                                }
                            });
                            if (containers) {
                                creep.memory.structureTarget = containers.id;
                                if (creep.transfer(containers, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(containers);
                                }
                                if (containers.store[RESOURCE_ENERGY] == containers.storeCapacity) {
                                    //If container fills up on this tick, forget it.
                                    creep.memory.structureTarget = undefined;
                                }
                            } else {
                                //Build
                                var targets2 = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
                                if (targets2) {
                                    creep.memory.structureTarget = targets2.id;
                                    if (creep.build(targets2) == ERR_NOT_IN_RANGE) {
                                        creep.moveTo(targets2);
                                    }
                                } else {
                                    //Upgrade
                                    creep.memory.structureTarget = creep.room.controller.id;
                                    if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                                        creep.moveTo(creep.room.controller);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
};

module.exports = creep_work5;