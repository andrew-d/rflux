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
 *  - By the time the initial dispatch loop is finished, we know all the
 *    waiters and everything that's not waiting (i.e. everything that
 *    hasn't yet called waitFor).  We can then go through the list of all
 *    stores repeatedly and dispatch to them.
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

    // Wait tracking
    this.waiters = {};
    this.finished = {};
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

    // Now, repeatedly process dependencies.
    try {
        // First, dispatch to every store.
        _.forEach(this.stores, function(store, name) {
            store.__handleAction__(action);

            // If this store hasn't registered a wait, it's finished.
            this.finished[name] = !this.waiters[name];
        }, this);

        this._processDependencies(action);
    } finally {
        this.dispatching = false;
    }
};

Dispatcher.prototype._processDependencies = function(action) {
    while( !_.isEmpty(this.waiters) ) {
        var removed = 0;

        var newWaiters = _.omit(this.waiters, function(spec, name) {
            // If all the stores that this waiter is waiting on have finished
            // dispatching, then we can call the callback.
            var canDispatch = _.every(spec.stores, function(waitName) {
                return !!this.finished[waitName];
            }, this);

            if( canDispatch ) {
                spec.callback();
                this.finished[name] = true;
                removed += 1;
                return true;
            }

            return false;
        }, this);

        // We enforce that each run through the loop we must "make progress" -
        // i.e. we must remove at least one waiter from our list of waiters on
        // every iteration.  If not, then we have an indirect deadlock.
        if( removed === 0 ) {
            throw new Error("indirect deadlock detected between: " +
                            _.keys(this.waiters).join(", "));
        }

        this.waiters = newWaiters;
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
    if( _.indexOf(stores, waiterName) !== -1 ) {
        throw new Error("a store can't wait on itself");
    }

    // If the store is already waiting, it's an error.
    if( this.waiters[waiterName] ) {
        // TODO: print existing wait
        // TODO: testme
        throw new Error("store " + waiterName + " is already waiting");
    }

    _.each(stores, function(store) {
        if( !this.stores[store] ) {
            throw new Error("can't wait on non-existant store: " + store);
        }

        if( this.waiters[store] && _.contains(this.waiters[store].stores, waiterName) ) {
            // TODO: testme
            throw new Error('circular dependency detected: "' + store + '" and "' +
                            waiterName + '" are waiting on each other');
        }
    }, this);

    this.waiters[waiterName] = {
        waiter: waiter,
        stores: stores,
        callback: fn,
    };
};

module.exports = Dispatcher;
