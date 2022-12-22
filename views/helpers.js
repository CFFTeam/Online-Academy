export default {
    ifEquals: function (a, b, options) {
        return a === b ? options.fn(this) : options.inverse(this);
    }
};