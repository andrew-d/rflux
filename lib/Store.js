var _ = require('lodash');

var Store = function(options) {
    this.options = options || {};
    this.__actions__ = {};
};

// Add a new action to be called.
Store.prototype.__addAction__ = function(type, handler) {
    if( typeof handler !== 'function' ) {
        throw new Error('handler is not a function');
    }

    this.__actions__[type] = handler;
};

// This is actually called when we are to process an action.
Store.prototype.__handleAction__ = function(action) {
    var handler = this.__actions__[action.type];

    if( !!handler ) {
        handler.call(this, action.payload, action.type);
    }
};

// Wait for something.
Store.prototype.waitFor = function(stores, fn) {
    this.dispatcher.waitFor(this, stores, fn);
};

module.exports = Store;
