const {radToDeg} = require('./util.js');

class Vector3 {
    constructor(_vec) {
        this._x = _vec.x;
        this._y = _vec.y;
        this._z = _vec.z;

        this.sub = this.sub.bind(this);
        this.add = this.add.bind(this);
        this.dot = this.dot.bind(this);
        this.distanceTo = this.distanceTo.bind(this);
        this.normalize = this.normalize.bind(this);
        this.lookAt = this.lookAt.bind(this);
        this.lerpToward = this.lerpToward.bind(this);
        this.moveToward = this.moveToward.bind(this);
        this.angleTo = this.angleTo.bind(this);
    }

    distanceTo(_vec) {
        return Math.sqrt(
            Math.pow(Math.abs(_vec.x - this.x), 2) +
            Math.pow(Math.abs(_vec.y - this.y), 2) +
            Math.pow(Math.abs(_vec.z - this.z), 2));
    }

    sub(_vec) {
        return new Vector3({
            x: this.x - _vec.x,
            y: this.y - _vec.y,
            z: this.z - _vec.z
        });
    }

    add(_vec) {
        return new Vector3({
            x: this.x + _vec.x,
            y: this.y + _vec.y,
            z: this.z + _vec.z
        });
    }

    dot(_vec) {
        return _vec.x * this.x + _vec.y * this.y + _vec.z * this.z;
    }

    scalar(_val) {
        return new Vector3({
            x: this.x * _val,
            y: this.y * _val,
            z: this.z * _val
        });
    }

    normalize() {
        return new Vector3({
            x: this._x / this.magnitude,
            y: this._y / this.magnitude,
            z: this._z / this.magnitude
        });
    }

    lookAt(_vec) {
        return _vec.sub(this);
    }

    // speed is based on distance
    lerpToward(_vec, _speed) {
        const _dir = this.lookAt(_vec);
        const _scaledDir = _dir.scalar(_speed);
        const _added = this.add(_scaledDir);
        return _added;
    }

    // speed is constant
    moveToward(_vec, _speed) {
        const _dir = this.lookAt(_vec).normalize();
        const _scaledDir = _dir.scalar(_speed);
        const _dist = this.distanceTo(_vec);
        if (_scaledDir.magnitude >= _dist) {
            return _vec;
        }
        const _added = this.add(_scaledDir);
        return _added;
    }

    angleTo(_vec) {
        var _angle = Math.atan2(_vec.z, _vec.x) - Math.atan2(this.z, this.x);
        if (_angle < 0) {
            _angle += 2 * Math.PI;
        }
        // Don't know why we have to add 90 here..
        return radToDeg(_angle) + 180;
    }

    equals(_vec) {
        return this.x == _vec.x && this.y == _vec.y && this.z == _vec.z;
    }

    print() {
        return `(${this._x}, ${this._y}, ${this._z})`;
    }

    get x() {
        return this._x;
    }
    set x(_val) {
        this._x = _val;
    }

    get y() {
        return this._y;
    }
    set y(_val) {
        this._y = _val;
    }

    get z() {
        return this._z;
    }
    set z(_val) {
        this._z = _val;
    }

    get magnitude() {
        const _ret = Math.sqrt(
            Math.pow(this.x, 2) +
            Math.pow(this.y, 2) +
            Math.pow(this.z, 2));
        if (_ret == 0) return 0.01;
        return _ret;
    }

    get obj() {
        return {
            x: this._x,
            y: this._y,
            z: this._z
        }
    }
}

const Vec3Zero = new Vector3({x:0,y:0,z:0});
const Vec3Right = new Vector3({x:1,y:0,z:0});

const LowPrecisionSimpleVector3 = function(_vec) {
    return {
        x: Math.round(_vec.x * 100) / 100,
        y: Math.round(_vec.y * 100) / 100,
        z: Math.round(_vec.z * 100) / 100
    }
}

module.exports = {
    Vector3,
    Vec3Zero,
    Vec3Right,
    LowPrecisionSimpleVector3
}