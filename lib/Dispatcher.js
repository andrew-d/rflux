var _ = require('lodash');

/* To dispatch and handle dependencies:
 *  - Dispatch into the store always
 *  - If the store has a "waitFor" called on it, then it calls back
 *    into the dispatcher with the store names, and callback.
 *  - The dispatcher will first dispatch to every store, and then
 *    repeatedly run a loop to process waits.  Essentially, it enforces
 *    that each iteration of the loop must make progress by dispatching
 *    to another waiting store.  If it doesn't, then we throw an error
 *    indicating a deadlock.
 *
 *
 */

var Dispatcher = function(stores) {
    if( typeof stores !== "object" ) {
        throw new Error('"stores" argument must be an object, not: ' + typeof stores);
    }

    this.stores = {};
    _.forOwn(stores, function(store, name) {
        this.stores[name] = store;
        store.dispatcher = this;
    }, this);

    // Whether we're currently dispatching an action.
    this.dispatching = false;

    // Queue of items to dispatch.
    this.toDispatch = [];
};

Dispatcher.prototype.dispatch = function(action) {
    // If we're already dispatching, it's an error.
    if( this.dispatching ) {
        throw new Error("can't dispatch recursively");
    }
    if( !action || !action.type ) {
        throw new Error("can't dispatch an action without a type");
    }

    this.dispatching = true;

    // First, dispatch to every store.
    _.forEach(this.stores, function(store) {
        store.__handleAction__(action);
    });

    // Now, repeatedly process dependencies.
    try {
        // TODO: actually dispatch things
    } finally {
        this.dispatching = false;
    }
};

Dispatcher.prototype._processDependencies = function(action) {
    while( true ) {
        //
    }
};


Dispatcher.prototype.waitFor = function(waiter, stores, fn) {
    if( !this.dispatching ) {
        throw new Error("can't wait unless an action is being dispatched");
    }

    // Validate that the store isn't waiting on itself.
    var waiterName = _.findKey(this.stores, function(store) {
        return store === waiter;
    });
    if( _.indexOf(stores, waiterName) ) {
        throw new Error("a store can't wait on itself");
    }

    // Save the wait info.
    // TODO

    _.each(stores, function(store) {
        if( !this.stores[store] ) {
            throw new Error("can't wait on non-existant store: " + store);
        }

        // TODO: check to see if 'store' is waiting on 'waiterName'
    }, this);

    // TODO save wait for this store
};

module.exports = Dispatcher;
