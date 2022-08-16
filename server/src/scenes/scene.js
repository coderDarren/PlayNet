
class Scene {
    constructor(_game) {
        this._game = _game;
        this._npcs = [];
    }

    get npcs() {
        return this._npcs;
    }
}

module.exports = Scene;