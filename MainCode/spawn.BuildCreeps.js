var spawn_BuildCreeps = {
	run: function(spawn, bestWorker, thisRoom) {
		var RoomCreeps = thisRoom.find(FIND_MY_CREEPS);

		var harvesters = _.filter(RoomCreeps, (creep) => creep.memory.priority == 'harvester');
		var builders = _.filter(RoomCreeps, (creep) => creep.memory.priority == 'builder');
		var upgraders = _.filter(RoomCreeps, (creep) => creep.memory.priority == 'upgrader');
		//TODO : Count creeps by room, not globally.
		//var harvesters = _.filter(Game.creeps, (creep) => creep.memory.priority == 'harvester');
		//var builders = _.filter(Game.creeps, (creep) => creep.memory.priority == 'builder');
		//var upgraders = _.filter(Game.creeps, (creep) => creep.memory.priority == 'upgrader');

		var harvesterMax = 2;
		var builderMax = 1;
		var upgraderMax = 2;
		//How many creeps can mine at once
		var mineSpots = [2, 5];
		//Add sources from N to S
		var strSources = Memory.sourceList[thisRoom.name];
		var assignedSlot1 = _.filter(RoomCreeps, (creep) => creep.memory.sourceLocation == strSources[0]);

		var bareMinConfig = [MOVE, MOVE, WORK, CARRY, CARRY];

		if (RoomCreeps.length == 0 && spawn.canCreateCreep(bareMinConfig) == OK) {
			//In case of complete destruction, make a minimum viable worker
			spawn.createCreep(bareMinConfig, undefined, {
				priority: 'harvester',
				sourceLocation: strSources[1]
			});
		} else if (Memory.roomsUnderAttack.indexOf(thisRoom.name) != -1) {
			if (Memory.roomsPrepSalvager.indexOf(thisRoom.name) != -1) {
				if (thisRoom.energyAvailable >= 1000 && salvagers.length == 0) {
					var blockedRole = '';
					if (Memory.creepInQue.indexOf(thisRoom.name) >= 0) {
						var RoomPointer = Memory.creepInQue.indexOf(thisRoom.name)
						blockedRole = Memory.creepInQue[RoomPointer + 1];
					}
					if (blockedRole != 'salvager') { //Produce a salvager unit to pick up the dropped resources
						spawn.createCreep([MOVE, MOVE, CARRY, CARRY, CARRY, CARRY], undefined, {
							priority: 'salvager',
							storageTarget: strStorage[0]
						});
						Memory.creepInQue.push(thisRoom.name, 'salvager', '', spawn.name);
					}


				}
			} else if (thisRoom.energyAvailable >= 400) {
				//Try to produce millitary units

				//Melee unit set: TOUGH, TOUGH, MOVE, MOVE, MOVE, ATTACK - 250
				//Ranged unit set: MOVE, MOVE, RANGED_ATTACK - 250

				//Damaged modules do not work, put padding first.

				var meleeUnits = _.filter(RoomCreeps, (creep) => creep.memory.priority == 'melee');
				var rangedUnits = _.filter(RoomCreeps, (creep) => creep.memory.priority == 'ranged');

				var ChosenPriority = '';
				if (meleeUnits <= rangedUnits) {
					ChosenPriority = 'melee';
				} else {
					ChosenPriority = 'ranged';
				}

				var ToughCount = 0;
				var MoveCount = 0;
				var AttackCount = 0;
				var RangedCount = 0;
				var totalParts = 0;

				var remainingEnergy = thisRoom.energyAvailable;
				while ((remainingEnergy / 400) >= 1) {
					switch (ChosenPriority) {
						case 'melee':
							ToughCount = ToughCount + 1;
							MoveCount = MoveCount + 2;
							AttackCount = AttackCount + 3;
							totalParts = totalParts + 6;
							remainingEnergy = remainingEnergy - 350;
							break;
						case 'ranged':
							MoveCount = MoveCount + 2;
							RangedCount = RangedCount + 2;
							totalParts = totalParts + 4;
							remainingEnergy = remainingEnergy - 400;
							break;
					}

					if (totalParts >= 50) {
						break;
					}
				}

				var ChosenCreepSet = [];
				while (ToughCount > 0) {
					ChosenCreepSet.push(TOUGH);
					ToughCount--;
				}
				while (MoveCount > 1) {
					ChosenCreepSet.push(MOVE);
					MoveCount--;
				}
				while (AttackCount > 0) {
					ChosenCreepSet.push(ATTACK);
					AttackCount--;
				}
				while (RangedCount > 0) {
					ChosenCreepSet.push(RANGED_ATTACK);
					RangedCount--;
				}

				//Insert one move module last so the creep can still run
				ChosenCreepSet.push(MOVE);

				if (ChosenCreepSet.length > 50) {
					while (ChosenCreepSet.length > 50) {
						ChosenCreepSet.splice(0, 1)
					}
				}

				spawn.createCreep(ChosenCreepSet, undefined, {
					priority: ChosenPriority
				});
			}

		} else if ((harvesters.length < harvesterMax || builders.length < builderMax || upgraders.length < upgraderMax) && spawn.canCreateCreep(bestWorker) == OK) {
			var prioritizedRole = 'harvester';
			if (harvesters.length < harvesterMax) {
				prioritizedRole = 'harvester';
			} else if (upgraders.length < upgraderMax) {
				prioritizedRole = 'upgrader';
			} else if (builders.length < builderMax) {
				prioritizedRole = 'builder';
			}

			var creepSourceID = '';
			if ((assignedSlot1.length) >= Math.ceil(mineSpots[0] * 1.2)) {
				//Assign spot 2
				creepSourceID = strSources[1];
			} else {
				//Assign spot 1
				creepSourceID = strSources[0];
			}
			spawn.createCreep(bestWorker, undefined, {
				priority: prioritizedRole,
				fromSpawn: spawn,
				sourceLocation: creepSourceID
			});
		}
	}
};

module.exports = spawn_BuildCreeps;