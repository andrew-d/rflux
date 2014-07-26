var _ = require('lodash');

/* Service actions should be functions that return a promise.  If the promise
 * is fulfilled, then the 'ACTION_COMPLETED' message will be dispatched.
 * Otherwise, the 'ACTION_FAILED' message will be dispatched.
 *
 * TODO:
 *  - implement the completed/failed functions
 *  - how do we dispatch here - we aren't bound to a dispatcher
 */

var createActions = function(spec) {
    var methods = {},
        statics = {};

    _.forOwn(spec, function(val, key) {
        switch(key) {
        case "actions":
            _.forOwn(val, function(action, func) {
                ret[action] = func;

                // TODO: real functions here
                ret[action+'_COMPLETED'] = null;
                ret[action+'_FAILED'] = null;
            });
            break;

        case "methods":
            _.forOwn(val, function(action, func) {
                ret[action] = func;
            });
            break;

        case "statics":
            statics = _.assign(statics, val);
            break;

        default:
            throw new Error("unknown key in action spec: " + key);
        }
    });

    // TODO: what to return?
};

module.exports = createActions;
