export default {
    eq: (v1, v2) => v1 === v2 || +v1 === +v2,
    ne: (v1, v2) => v1 !== v2 || +v1 !== +v2,
    lt: (v1, v2) => v1 < v2 || +v1 < +v2,
    gt: (v1, v2) => v1 > v2 || +v1 > +v2,
    lte: (v1, v2) => v1 <= v2 || +v1 <= +v2,
    gte: (v1, v2) => v1 >= v2 || +v1 >= +v2,
    and() {
        return Array.prototype.every.call(arguments, Boolean);
    },
    or() {
        return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
    },
    times(n, block) {
        var accum = '';
        for(var i = 0; i < n; ++i)
            accum += block.fn(i);
        return accum;
    },
};