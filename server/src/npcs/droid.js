const crypto = require('crypto');
const {Vector3} = require('../util/vector');

const droid = function(_level, _pos, _rot, _nameOverride=null) {
    const _id = crypto.randomBytes(5).toString('hex');
    _rot.y = Math.random() * 360;
    
    return {
        id: _id,
        name: _nameOverride || 'Droid',
        level: _level,
        maxHealth: 40*_level,
        health: 40*_level,
        maxEnergy: 20*_level,
        energy: 20*_level,
        attackSpeed: 1,
        rechargeSpeed: 1.5,
        aggroRange: 8,
        retreatRange: 10,
        attackRange: 5,
        inCombat: false,
        inAttackRange: false,
        respawnTime: 5, // in seconds
        xpReward: 50*_level,
        xpRewardVariance: 10*_level,
        transform: {
            pos: new Vector3(_pos).obj,
            rot: new Vector3(_rot).obj
        },
        inCombat: false,
        healDelta: 50,
        runSpeed: 2,
        lootTime: 120, // 2 minutes
        minDamage: 0.01*_level,
        maxDamage: 0.01*_level,
        hitRate: 0.75,
        // !! TODO
        // Create mob actions initializer
        actions: []
    }
}

module.exports = droid;