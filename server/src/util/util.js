
const radToDeg = function(_rad) {
    return _rad * (180 / Math.PI);
}

const accumulate = function(_arr, _prop) {
    var _ret = 0;

    for (var i in _arr) {
        _ret += _arr[i][_prop];
    }

    return _ret;
}

module.exports = {
    radToDeg,
    accumulate
}