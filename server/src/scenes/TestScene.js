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
            new NPC(_game, new droid(1, {x:0,y:1.1,z:4},{x:0,y:0,z:0})),
            new NPC(_game, new droid(1, {x:-2,y:1.1,z:3.1},{x:0,y:0,z:0})),
            new NPC(_game, new droid(1, {x:-2.2,y:1.1,z:1.25},{x:0,y:0,z:0}))
        ],
        waypointGraph
    )
};