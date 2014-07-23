var util  = require('util'),
    _     = require('lodash'),
    Store = require('./Store.js');

var RESERVED_KEYS = ['dispatcher', 'waitFor'];

var createStore = function(spec) {
    // There are some keys that we reserve.
    _.each(RESERVED_KEYS, function(key) {
        if( spec[key] ) {
            throw new Error('Reserved key "' + key + '" found in store definition');
        }
    });

    var ctor = function(options) {
        Store.call(this, options);

        _.forOwn(spec, function(val, key) {
            if( key === 'initialize' ) {
                // Ignored.
            } else if( key === 'actions' ) {
                // TODO: register actions
            } else if( typeof val === "function" ) {
                this.__actions__[key] = val.bind(this);
            } else {
                this[key] = val;
            }
        });

        if( spec.initialize ) {
            spec.initialize.call(this, options);
        }

        if( spec.getInitialState ) {
            this.state = spec.getInitialState.call(this);
        } else {
            this.state = {};
        }
    };

    util.inherits(ctor, Store);
    return ctor;
};

module.exports = createStore;
