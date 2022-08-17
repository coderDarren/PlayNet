
class Scene {
    constructor(_npcs, _waypointGraph) {
        this._npcs = _npcs;
        this._waypointGraph = _waypointGraph;
    }

    get npcs() {
        return this._npcs;
    }
    
    get waypointGraph() {
        return this._waypointGraph;
    }
}

module.exports = Scene;