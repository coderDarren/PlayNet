
const {Vector3, LowPrecisionSimpleVector3} = require('./util/vector.js');
const {filter} = require('lodash');
const {accumulate} = require('./util/util.js');

const NETMSG_CHAT = "CHAT";
const NETMSG_PLAYER_TRANSFORM_CHANGE = "PLAYER_TRANSFORM_CHANGE";
const NETMSG_NPC_SPAWN = "MOB_SPAWN";
const NETMSG_NPC_EXIT = "MOB_EXIT";
const NETMSG_PLAYER_SPAWN = "PLAYER_SPAWN";
const NETMSG_PLAYER_EXIT = "PLAYER_EXIT";

class Player {
    constructor(_game, _socket, _data=null) {
        _data = {
            ..._data.player,
            ..._data
        }
        delete _data.player;
        this._game = _game;
        this._data = _data;
        this._socket = _socket;
        this._nearbyNPCs = [];
        this._nearbyNPCsState = {};
        this._nearbyPlayers = [];
        this._nearbyPlayersState = {};
        this._dead = false;

        // these values help us determine if the player is stationary or not
        this._lastFramePos = this._data.transform.pos;
        this._lastFrameRot = this._data.transform.rot;
        this._posChange = 0;
        this._rotChange = 0;
        this._stationaryTimer = 0;

        // incoming events from player
        this.__on_transform_updated__ = this.__on_transform_updated__.bind(this);
        this.__hook__ = this.__hook__.bind(this);

        // player emit events
        this.__on_npc_spawn__ = this.__on_npc_spawn__.bind(this);
        this.__on_npc_exit__ = this.__on_npc_exit__.bind(this);
        this.__on_player_spawn__ = this.__on_player_spawn__.bind(this);
        this.__on_player_exit__ = this.__on_player_exit__.bind(this);

        // updaters
        this.__handle_nearby_objects__ = this.__handle_nearby_objects__.bind(this);
        this.update = this.update.bind(this);
    }

    __hook__() {
        this._socket.on(NETMSG_PLAYER_TRANSFORM_CHANGE, this.__on_transform_updated__);
    }

    update() {
        this.__detect_stationary__();
        this._nearbyNPCs = this.__handle_nearby_objects__(this._nearbyNPCs, this._nearbyNPCsState, this._game.mobs, 'id', 50, this.__on_mob_spawn__, this.__on_mob_exit__);
        this._nearbyPlayers = this.__handle_nearby_objects__(this._nearbyPlayers, this._nearbyPlayersState, this._game.players, 'name', 50, this.__on_player_spawn__, this.__on_player_exit__);
    }

    __detect_stationary__() {
        this._posChange = new Vector3(this._data.transform.pos).distanceTo(new Vector3(this._lastFramePos));
        this._rotChange = new Vector3(this._data.transform.rot).distanceTo(new Vector3(this._lastFrameRot));
        this._lastFramePos = this._data.transform.pos;
        this._lastFrameRot = this._data.transform.rot;
        if (this._posChange == 0 && this._rotChange == 0) {
            this._stationaryTimer += this._game.deltaTime;
        } else {
            this._stationaryTimer = 0;
        }
    }

    /*
     * This functions returns a mapped list of entities closest to the player
     * The returned array is used to determine which entities need to be notified about this player's state.
     * See the update function above.
     */
    __handle_nearby_objects__(_output, _state, _objects, id, _range, _evt_on_spawn_, _evt_on_exit_) {
        // clear the state
        Object.keys(_state).forEach((_key, _index) => {
            _state[_key] = false;
        });

        // update the state
        const _playerPos = new Vector3(this._data.transform.pos);
        _output = filter(_objects, function(_o) {
            // do not send player data back to himself
            if (_o.data.id == this._data.id) {
                //console.log(this._data.id)
                return false;
            }

            const _pos = new Vector3(_o.data.transform.pos);
            
            // compare the distance of the player to the object
            if (_playerPos.distanceTo(_pos) <= _range) {
                
                // if within range, check to see if this object has been spawned yet
                //console.log(_o.data[id])
                if (_state[_o.data[`${id}`]] == undefined) { // object has not been spawned
                    // send spawn event
                    _evt_on_spawn_(_o);
                }

                // update the object state
                _state[_o.data[`${id}`]] = true;

                // do not send object data that is not moving
                if (_o.isStationary) {
                    return false;
                }

                // include this object in the nearbyMobs array for this frame
                return true;
            }

            // exclude this object from the nearbyMobs array for this frame
            return false;

        }.bind(this));

        // handle exits
        Object.keys(_state).forEach((_key, _index) => {
            // if the state is false at this point, that means the object..
            // ..was in range last frame, but not in range during this frame
            if (_state[_key] == false) {
                // send exit event
                _evt_on_exit_(_key);
                delete _state[_key];
            }
        });

        return _output;
    }

    __on_npc_spawn__(_mob) {
        this._socket.emit(NETMSG_NPC_SPAWN, {message:JSON.stringify(_mob.spawnData)});
    }

    __on_npc_exit__(_mobId) {
        this._socket.emit(NETMSG_NPC_EXIT, {message:_mobId});
    }

    __on_player_spawn__(_player) {
        this._socket.emit(NETMSG_PLAYER_SPAWN, {message:JSON.stringify(_player.data)});
    }

    __on_player_exit__(_playerName) {
        this._socket.emit(NETMSG_PLAYER_EXIT, {message:_playerName});
    }

    __on_transform_updated__(_transform) {
        this._data.transform = _transform;
        this._game.updatePlayer(this);
    }

    get data() { return this._data; }
    get transform() { return this._data.transform; }
    get sessionId() { return this._data.sessionId; }
    get socket() { return this._socket; }
    get nearbyNPCs() { return this._nearbyNPCs; }
    get nearbyPlayers() { return this._nearbyPlayers; }
    get isStationary() { return this._stationaryTimer > 2; }
    get dead() { return this._dead; }
}

module.exports = Player;