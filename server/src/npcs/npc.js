'use strict';
const {map, find, filter} = require('lodash');
const {Vector3, Vec3Right, LowPrecisionSimpleVector3} = require('../util/vector.js');

const NETMSG_NPC_ATTACK_START = "NPC_ATTACK_START";
const NETMSG_NPC_ATTACK = "NPC_ATTACK";
const NETMSG_NPC_COMBAT_STATE_CHANGE = "NPC_COMBAT_STATE_CHANGE";
const NETMSG_NPC_ATTACK_RANGE_CHANGE = "NPC_ATTACK_RANGE_STATE_CHANGE";
const NETMSG_NPC_HEALTH_CHANGE = "NPC_HEALTH_CHANGE";
const NETMSG_NPC_DEATH = "NPC_DEATH";

class NPC {

    constructor(_game, _data) {
        this._game = _game;
        this._data = _data;
        // track initial data for respawn
        this._initialData = JSON.parse(JSON.stringify(this._data));
        this._targets = [];
        this._defaultPos = new Vector3(this._data.transform.pos);
        this._defaultRot = new Vector3(this._data.transform.rot);
        this._speedVariance = 2;

        this.__detect_stationary__ = this.__detect_stationary__.bind(this);
        this.__choose_target__ = this.__choose_target__.bind(this);
        this.__follow_target__ = this.__follow_target__.bind(this);
        this.__lookAt_target__ = this.__lookAt_target__.bind(this);
        this.__attack_target__ = this.__attack_target__.bind(this);
        this.__target_is_in_range__ = this.__target_is_in_range__.bind(this);
        this.__patrol__ = this.__patrol__.bind(this);
        this.__retreat__ = this.__retreat__.bind(this);
        this.__heal_over_time__ = this.__heal_over_time__.bind(this);
        this.__kill__ = this.__kill__.bind(this);
        this.__reset__ = this.__reset__.bind(this);
        this.__handle_loot__ = this.__handle_loot__.bind(this);
        this.__send_message_to_nearby_players__ = this.__send_message_to_nearby_players__.bind(this);
        this.__on_attack_range_state_change__ = this.__on_attack_range_state_change__.bind(this);
        this.__on_combat_state_change__ = this.__on_combat_state_change__.bind(this);
        this.__on_health_change__ = this.__on_health_change__.bind(this)
        this.__on_death__ = this.__on_death__.bind(this);

        this.__reset__();
    }

    update() {
        this.__detect_stationary__();
        const _npcPos = new Vector3(this._data.transform.pos);
        
        if (this._dead) {
            this.__handle_loot__();
        } else if (this._data.inCombat) {
            this.__choose_target__();
            this.__follow_target__();
            this.__attack_target__();
        } else if (!_npcPos.equals(this._defaultPos)) {
            this.__retreat__();
            this.__patrol__(); // this will look for new targets while running away
            this.__heal_over_time__();
        } else if (!this._dead) { // alive
            this.__patrol__();
            this.__heal_over_time__();
        }
    }

    __detect_stationary__() {
        this._posChange = new Vector3(this._data.transform.pos).distanceTo(new Vector3(this._lastFramePos));
        this._rotChange = new Vector3(this._data.transform.rot).distanceTo(new Vector3(this._lastFrameRot));
        this._lastFramePos = this._data.transform.pos;
        this._lastFrameRot = this._data.transform.rot;
    }

    hit(_npcHitInfo) {
        if (this._damageTable[_npcHitInfo.playerName] == undefined) {
            this._damageTable[_npcHitInfo.playerName] = 0;
        }
        this._damageTable[_npcHitInfo.playerName] += _npcHitInfo.dmg;

        this._data.health -= _npcHitInfo.dmg;
        if (this._data.health <= 0) {
            this._data.health = 0;
            this.__kill__();
        }
        
        this.__on_health_change__();

        if (!this._data.inCombat) {
            const _targetPos = new Vector3(this._game.getPlayer(_npcHitInfo.playerName).transform.pos);
            //this._waypoints = getPath(this._game.scene.waypointGraph, _npcPos, _targetPos);
            //this._waypoint = this._waypoints[0];
            this._waypoint = _targetPos;
            this.__lookAt_target__();
            this._rechargeTimer = this._data.rechargeSpeed;
            this._data.inCombat = true;
            this.__on_combat_state_change__();
        }
    }

    __choose_target__() {
        const _npcPos = new Vector3(this._data.transform.pos);
        
        // find nearby potential targets
        this._targets = this._game.scanNearbyPlayers(this._data.transform.pos, this._data.retreatRange);

        // start with the closest target
        if (this._target == null) {
            this._target = this._targets[0];
            if (this._target == null) {
                return;
            }
            this.__on_attack_start__(this._target.name);
            return;
        }

        // choose the target that does the most damage
        var _max = 0;
        var _maxIndex = 0;
        for (var i in this._targets) {
            const _target = this._targets[i];
            if (this._damageTable[_target.name] == undefined) {
                this._damageTable[_target.name] = 0;
            }

            if (this._damageTable[_target.name] > _max) {
                _max = this._damageTable[_target.name];
                _maxIndex = i;
            }
        }

        // take the npc out of combat if there are no more targets or if the npc is 50 units away from their spawn pos
        if (this._targets.length == 0 || _npcPos.distanceTo(this._defaultPos) > this._data.retreatRange) {
            //this._waypoints = getPath(this._game.scene.waypointGraph, _npcPos, this._defaultPos);
            //this._waypoint = this._waypoints[0];
            this._waypoint = this._defaultPos;
            this.__lookAt_target__();
            this._data.inCombat = false;
            this._target = null;
            this.__on_combat_state_change__();
            return;
        }

        // assign the target if it is new
        if (this._targets[_maxIndex].name != this._target.name) {
            // this is a new target
            this.__on_attack_start__(this._targets[_maxIndex].name);
        }

        this._target = this._targets[_maxIndex];
    }

    __follow_target__() {
        if (!this._target) return;
        const _npcPos = new Vector3(this._data.transform.pos);
        const _targetPos = new Vector3(this._target.transform.pos);
        if (_npcPos.distanceTo(_targetPos) < 1) {
            return;
        }

        // iterate over positions moving to each one in path
        if (_npcPos.equals(this._waypoint)) {
            //this._waypoints = getPath(this._game.scene.waypointGraph, _npcPos, _targetPos);
            //const _index = this._waypoints.length > 1 ? 1 : 0;
            //this._waypoint = this._waypoints[_index];
            this._waypoint = _targetPos;
            this.__lookAt_target__();
        }

        this._data.transform.pos = _npcPos.moveToward(this._waypoint, this._runSpeed * this._game.deltaTime).obj;
    }

    __lookAt_target__() {
        const _npcPos = new Vector3(this._data.transform.pos);
        const _dir = _npcPos.lookAt(this._waypoint);
        this._data.transform.rot.y = _dir.angleTo(Vec3Right);
    }

    __attack_target__() {
        // if the target is in range and npc recharge is ready
        if (this.__target_is_in_range__() && this._rechargeTimer >= this._data.rechargeSpeed) {
            // build up to attack
            this._attackTimer += this._game.deltaTime;
            if (this._attackTimer > this._data.attackSpeed) {
                // send damage info to all nearby players
                var _dmg = Math.floor(this._data.minDamage + Math.random() * this._data.maxDamage);
                if (Math.random() < 1 - this._data.hitRate) {
                    _dmg = 0;
                }
                this.__on_hit_player__(this._target, _dmg);

                // reset timers
                this._attackTimer = 0;
                this._rechargeTimer = 0;
            }
        } else if (this._rechargeTimer < this._data.rechargeSpeed) {
            this._attackTimer = 0;
            this._rechargeTimer += this._game.deltaTime;

            if (this._rechargeTimer >= this._data.rechargeSpeed) {
                // force attack animation
                this.__on_attack__();
            }
        }
    }

    __target_is_in_range__() {
        if (this._target == null) {
            return false;
        }
        
        const _npcPos = new Vector3(this._data.transform.pos);
        const _targetPos = new Vector3(this._target.transform.pos);
        const _dist = _npcPos.distanceTo(_targetPos);
        if (_dist <= this._data.attackRange && !this._data.inAttackRange) {
            this._data.inAttackRange = true;
            this.__on_attack_range_state_change__();
        } else if (_dist > this._data.attackRange && this._data.inAttackRange) {
            this._data.inAttackRange = false;
            this.__on_attack_range_state_change__();
        }

        return this._data.inAttackRange;
    }

    __retreat__() {
        const _npcPos = new Vector3(this._data.transform.pos);
        const _targetPos = this._defaultPos;

        // iterate over positions moving to each one in path
        if (_npcPos.equals(this._waypoint)) {
            //this._waypoints = getPath(this._game.scene.waypointGraph, _npcPos, _targetPos);
            //const _index = this._waypoints.length > 1 ? 1 : 0;
            //this._waypoint = this._waypoints[_index];
            this._waypoint = _targetPos;
            this.__lookAt_target__();
        }

        this._data.transform.pos = _npcPos.moveToward(this._waypoint, this._runSpeed * this._game.deltaTime).obj;
    }

    __patrol__() {
        this._targets = this._game.scanNearbyPlayers(this._data.transform.pos, this._data.aggroRange);
        const _npcPos = new Vector3(this._data.transform.pos);
        this._data.transform.rot = this._defaultRot.obj;
        if (this._targets.length > 0) {
            const _targetPos = new Vector3(this._targets[0].transform.pos);
            //this._waypoints = getPath(this._game.scene.waypointGraph, _npcPos, _targetPos);
            //this._waypoint = this._waypoints[0];
            this._waypoint = _targetPos;
            this.__lookAt_target__();
            this._rechargeTimer = this._data.rechargeSpeed;
            this._damageTable = {};
            this._data.inCombat = true;
            this.__on_combat_state_change__();
        }
    }

    __heal_over_time__() {
        if (this._data.health > this._data.maxHealth) {
            this._data.health = this._data.maxHealth;
            this.__on_health_change__();
        } else if (this._data.health < this._data.maxHealth) {
            this._data.health += this._data.healDelta;
            this.__on_health_change__();
        }
    }

    __kill__() {
        if (this._dead) return;
        this._dead = true;
        this._data.inCombat = false;
        this._target = null;
        this._data.inAttackRange = false;
        this.__on_death__();
    }

    __handle_loot__() {
        this._lootTimer += this._game.deltaTime;
        if (this._lootTimer > this._data.lootTime) {
            this._game.killNPC(this._data.id);
        }
    }

    __reset__() {
        this._target = null;
        this._data.health = this._data.maxHealth;
        this._data.energy = this._data.maxEnergy;
        this._runSpeed = this._data.runSpeed - (this._speedVariance / 2) + Math.random() * this._speedVariance;
        this._attackTimer = 0;
        this._rechargeTimer = 0;
        this._lootTimer = 0;

        // create a table for the npc to keep track of who is doing the most damage
        this._damageTable = {};
        this._aggroSwitchTime = 1;
        this._aggroSwitchTimer = 0;

        // these values help us determine if the npc is stationary or not
        this._lastFramePos = this._data.transform.pos;
        this._lastFrameRot = this._data.transform.rot;
        this._posChange = 0;
        this._rotChange = 0;
        this._dead = false;
    }

    __on_attack__() {
        this.__send_message_to_nearby_players__(NETMSG_NPC_ATTACK, {
            id: this._data.id,
        });
    }

    __on_attack_start__(_player) {
        this.__send_message_to_nearby_players__(NETMSG_NPC_ATTACK_START, {
            npcName: this._data.name,
            playerName: _player,
        });
    }

    __on_hit_player__(_player, _dmg) {
        // raw player gets the entire player object, not just its data fields
        var _rawPlayer = this._game.getPlayerRaw(_player.name);
        if (!_rawPlayer) {
            console.log(`Could not find raw player ${_player.name}`);
            return;
        }

        _rawPlayer.takeHit({
            npcId: this._data.id,
            npcName: this._data.name,
            playerName: _rawPlayer.data.name,
            dmg: _dmg
        });

        if (_rawPlayer.data.health.health == 0) {
            //this._waypoints = getPath(this._game.scene.waypointGraph, _npcPos, this._defaultPos);
            //this._waypoint = this._waypoints[0];
            this._waypoint = this._defaultPos;
            this.__lookAt_target__();
            this._data.inCombat = false;
            this._target = null;
            this.__on_combat_state_change__();
        }
    }

    __on_attack_range_state_change__() {
        this.__send_message_to_nearby_players__(NETMSG_NPC_ATTACK_RANGE_CHANGE, {
            id: this._data.id,
            inAttackRange: this._data.inAttackRange
        });
    }

    __on_combat_state_change__() {
        this.__send_message_to_nearby_players__(NETMSG_NPC_COMBAT_STATE_CHANGE, {
            id: this._data.id,
            inCombat: this._data.inCombat
        });
    }

    __on_health_change__() {
        
        this.__send_message_to_nearby_players__(NETMSG_NPC_HEALTH_CHANGE, {
            id: this._data.id,
            health: this._data.health
        });
    }

    async __on_death__() {
        // generate loot here...

        // calculate xp reward
        const _xp = this._data.xpReward + (Math.random()*this._data.xpRewardVariance);
        var _xpAllottment = [];

        // decide who gets xp for this kill
        Object.keys(this._damageTable).forEach((_key, _index) => {
            _xpAllottment.push({
                playerName: _key,
                xp: Math.floor(_xp)
            });
        });

        // send xp and loot
        this.__send_message_to_nearby_players__(NETMSG_NPC_DEATH, {
            id: this._data.id,
            name: this._data.name,
            xpAllottment: _xpAllottment,
            // loot list
            // loot rights (array of players that can loot)
            // xp distribution (array of players and xp allotment)
        });

        this._damageTable = {};

        this._game.respawnNPC(this._initialData, this._data.respawnTime*1000);
    }

    __send_message_to_nearby_players__(_evt, _msg) {
        const _nearbySockets = this._game.scanNearbyPlayerSockets(this._data.transform.pos, 50);
        for (var i in _nearbySockets) {
            const _socket = _nearbySockets[i];
            _socket.emit(_evt, {
                message: JSON.stringify(_msg)
            });
        }
    }

    get spawnData() { 
        return {
            id: this._data.id,
            name: this._data.name,
            level: this._data.level,
            maxHealth: this._data.maxHealth,
            health: this._data.health,
            maxEnergy: this._data.maxEnergy,
            energy: this._data.energy,
            transform: {
                pos: LowPrecisionSimpleVector3(this._data.transform.pos),
                rot: LowPrecisionSimpleVector3(this._data.transform.rot)
            },
            inCombat: this._data.inCombat,
            inAttackRange: this._data.inAttackRange,
            dead: this._dead
        }
    }

    get data() {
        return {
            id: this._data.id,
            transform: {
                pos: LowPrecisionSimpleVector3(this._data.transform.pos),
                rot: LowPrecisionSimpleVector3(this._data.transform.rot)
            }
        }
    }

    get isStationary() {
        return this._posChange == 0 && this._rotChange == 0;
    }

    get dead() {
        return this._dead;
    }

}

module.exports = NPC;