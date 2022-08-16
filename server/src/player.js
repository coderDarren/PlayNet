
class Player {
    constructor(_game, _socket, _savedData=null) {
        this._game = _game;
        this._socket = _socket;

        this.__sync_saved_data__ = this.__sync_saved_data__.bind(this);

        // optionally sync player with some saved data from a database
        this._savedData = _savedData;
    }

    __sync_saved_data__() {
        
    }
}

module.exports = Player;