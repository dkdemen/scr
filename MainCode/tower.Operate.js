var tower_Operate = {
	run: function(tower, attackDuration) {
		var thisRoom = tower.room;

		if (!Memory.towerNeedEnergy[thisRoom.name]) {
			Memory.towerNeedEnergy[thisRoom.name] = [];
		}
		if (!Memory.towerPickedTarget[thisRoom.name] || Game.time % 5 == 0) {
			//Recalc target every 5 ticks
			Memory.towerPickedTarget[thisRoom.name] = '';
		}

		var checkDelay = 10;
		if (thisRoom.storage) {
			if (thisRoom.storage.store[RESOURCE_ENERGY] >= 375000) {
				checkDelay = 2;
			} else if (thisRoom.storage.store[RESOURCE_ENERGY] >= 225000) {
				checkDelay = 5;
			} else if (thisRoom.storage.store[RESOURCE_ENERGY] <= 75000) {
				checkDelay = 500;
			}
		}

		var UnderAttackPos = Memory.roomsUnderAttack.indexOf(thisRoom.name);
		if (UnderAttackPos >= 0 && tower.energy > 0) {
			//Memory.roomCreeps[thisRoom.name];
			//Only if no salvager flag
			var didHeal = false
			var salvagerPos = Memory.roomsPrepSalvager.indexOf(thisRoom.name);
			if (salvagerPos == -1 && Memory.roomCreeps[thisRoom.name]) {
				var defenders = _.filter(Memory.roomCreeps[thisRoom.name], (creep) => creep.memory.priority == 'defender');
				if (defenders.length) {
					for (var y = 0; y < defenders.length; y++) {
						if (defenders[0].hits < defenders[0].hitsMax) {
							tower.heal(defenders[0]);
							didHeal = true;
							break;
						}
					}
				}
			}

			if (!didHeal) {
				var shootRandom = false;
				var closestHostile = Game.getObjectById(Memory.towerPickedTarget[thisRoom.name]);
				if (!closestHostile) {
					closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
						filter: (eCreep) => (!Memory.whiteList.includes(eCreep.owner.username))
					});
					shootRandom = true;
				}
				if (closestHostile) {
					Memory.towerPickedTarget[thisRoom.name] = closestHostile.id;
					if (shootRandom) {
						var randomTarget = tower.room.find(FIND_HOSTILE_CREEPS);
						if (randomTarget.length) {
							tower.attack(randomTarget[Math.floor(Math.random() * randomTarget.length)])
						}
					} else {
						tower.attack(closestHostile);
					}
					//Keep target for defenders to lock on
				} else if (tower.energy > (tower.energyCapacity * 0.5)) {
					//Save 50% of the tower's energy to use on repelling attackers
					var closestDamagedCreep = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
						filter: (creep) => creep.hits < creep.hitsMax - 50
					});
					if (closestDamagedCreep) {
						tower.heal(closestDamagedCreep);
					}
				}
			}
		} else if ((tower.energy > (tower.energyCapacity * 0.5)) && (Game.time % checkDelay == 0)) {
			//Save 50% of the tower's energy to use on repelling attackers
			var closestDamagedCreep = tower.pos.findClosestByRange(FIND_CREEPS, {
				filter: (creep) => (creep.hits < creep.hitsMax - 150) && (Memory.whiteList.includes(creep.owner.username) || creep.owner.username == "Montblanc")
			});
			if (closestDamagedCreep) {
				tower.heal(closestDamagedCreep);
			} else {
				//Repair ramparts about to decay
				var decayingRampart = tower.room.find(FIND_MY_STRUCTURES, {
					filter: (structure) => (structure.structureType = STRUCTURE_RAMPART && structure.ticksToDecay <= 10)
				});
				if (decayingRampart.length){
					//decayingRampart.sort(repairCompare);
					tower.repair(decayingRampart[Math.floor(Math.random() * decayingRampart.length)]);
				}
			}
		}

		if (tower.energy <= tower.energyCapacity - 150 && Memory.towerNeedEnergy[thisRoom.name].indexOf(tower.id) == -1) {
			Memory.towerNeedEnergy[thisRoom.name].push(tower.id);
		} else if (tower.energy > tower.energyCapacity - 150 && Memory.towerNeedEnergy[thisRoom.name].indexOf(tower.id) > -1) {
			var thisTowerIndex = Memory.towerNeedEnergy[thisRoom.name].indexOf(tower.id)
			Memory.towerNeedEnergy[thisRoom.name].splice(thisTowerIndex, 1);
		}
		//Enable to see tower coverage
		//thisRoom.visual.rect(thisTower.pos.x - 15, thisTower.pos.y - 15, 30, 30, {fill: '#ff0019', opacity: 0.2});
		//wew
	}
};

function repairCompare(a, b) {
    if (a.hits < b.hits)
        return -1;
    if (a.hits > b.hits)
        return 1;
    return 0;
}

module.exports = tower_Operate;