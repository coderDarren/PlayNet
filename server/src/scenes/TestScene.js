const Scene = require('./scene');
const NPC = require('../npcs/npc');
const {
    droid
} = require('../npcs/defs');

const waypointGraph = {"waypoints":[]}

module.exports = (_game) => {
    return new Scene(
        // npcs
        [
            new NPC(_game, new droid(1, {x:0,y:1.1,z:0},{x:0,y:0,z:0}))
        ],
        waypointGraph
    )
};