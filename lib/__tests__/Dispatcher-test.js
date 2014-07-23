jest.dontMock("lodash");
jest.dontMock("../Dispatcher.js");

var Dispatcher = require('../Dispatcher.js');

describe("Dispatcher", function() {
    describe('constructor', function() {
        it('will throw when passed a bad specification', function() {
            expect(function() {
                new Dispatcher(1234);
            }).toThrow('"stores" argument must be an object, not: number');
        });
    });

    describe('dispatch', function() {
        var store1, store2, dispatcher;

        beforeEach(function() {
            store1 = {__handleAction__: jest.genMockFunction()};
            store2 = {__handleAction__: jest.genMockFunction()};
            dispatcher = new Dispatcher({TheStore1: store1, TheStore2: store2});
        });

        it('will dispatch an action to all stores', function() {
            var action = {type: 'a', payload: 'b'};
            dispatcher.dispatch(action);

            expect(store1.__handleAction__.mock.calls.length).toBe(1);
            expect(store2.__handleAction__.mock.calls.length).toBe(1);

            expect(store1.__handleAction__.mock.calls[0][0]).toBe(action);
            expect(store2.__handleAction__.mock.calls[0][0]).toBe(action);
        });

        it('will disallow nested dispatching', function() {
            var action = {type: 'a', payload: 'b'};

            store1.__handleAction__ = function(action) {
                expect(action).toBe(action);
                expect(function() {
                    dispatcher.dispatch({type: 'foo'});
                }).toThrow("can't dispatch recursively");
            };

            dispatcher.dispatch(action);
            expect(store2.__handleAction__.mock.calls.length).toBe(1);
        });

        it('will allow dispatching twice in sequence', function() {
            var action1 = {type: 'a', payload: 'b'},
                action2 = {type: 'c', payload: 'd'};

            dispatcher.dispatch(action1);
            dispatcher.dispatch(action2);

            expect(store1.__handleAction__.mock.calls.length).toBe(2);
            expect(store2.__handleAction__.mock.calls.length).toBe(2);

            expect(store1.__handleAction__.mock.calls[0][0]).toBe(action1);
            expect(store1.__handleAction__.mock.calls[1][0]).toBe(action2);
            expect(store2.__handleAction__.mock.calls[0][0]).toBe(action1);
            expect(store2.__handleAction__.mock.calls[1][0]).toBe(action2);
        });

        it('will allow dispatching after an exception', function() {
            var action = {type: 'a', payload: 'b'},
                calls = 0;

            store1.__handleAction__ = function() {
                calls += 1;

                if( calls === 1 ) {
                    throw new Error("foo");
                }
            };

            expect(function() {
                dispatcher.dispatch(action);
            }).toThrow("foo");

            expect(function() {
                dispatcher.dispatch(action);
            }).not.toThrow();

            expect(calls).toBe(2);
        });

        it('will disallow invalid dispatches', function() {
            expect(function() {
                dispatcher.dispatch(1234);
            }).toThrow("can't dispatch an action without a type");

            expect(function() {
                dispatcher.dispatch({foo: 'bar'});
            }).toThrow("can't dispatch an action without a type");
        });
    });

    describe('waitFor', function() {
        it('will disallow waiting if no action is being dispatched', function() {
            var dispatcher = new Dispatcher({});

            expect(function() {
                dispatcher.waitFor(null, [], null);
            }).toThrow("can't wait unless an action is being dispatched");
        });

        it('will prevent a store from waiting on itself', function() {
            var store = {
                __handleAction__: function(action) {
                    var self = this;

                    expect(function() {
                        self.dispatcher.waitFor(self, ['Store'], function() {});
                    }).toThrow("a store can't wait on itself");
                },
            };
            var dispatcher = new Dispatcher({
                Store: store,
            });

            dispatcher.dispatch({type: 'foo'});
        });

        it('will prevent a store from waiting twice', function() {
            var store = {
                __handleAction__: function(action) {
                    this.dispatcher.waitFor(this, ['Foo'], function() {});

                    var self = this;
                    expect(function() {
                        self.dispatcher.waitFor(self, ['Foo'], function() {});
                    }).toThrow("store Store is already waiting");
                },
            };
            var dispatcher = new Dispatcher({
                Store: store,
                Foo: {__handleAction__: function() {}},
            });

            dispatcher.dispatch({type: 'foo'});
        });

        it('will disallow waiting on a nonexistant store', function() {
            var store = {
                __handleAction__: function(action) {
                    var self = this;
                    expect(function() {
                        self.dispatcher.waitFor(self, ['Foo'], function() {});
                    }).toThrow("can't wait on non-existant store: Foo");
                },
            };
            var dispatcher = new Dispatcher({
                Store: store,
            });

            dispatcher.dispatch({type: 'foo'});
        });

        it('will properly sequence waited actions', function() {
            var oneCalled = false, twoCalled = false;

            var store1 = {
                __handleAction__: function(action) {
                    this.dispatcher.waitFor(this, ['Store2'], function() {
                        expect(oneCalled).toBe(false);
                        expect(twoCalled).toBe(true);
                        oneCalled = true;
                    });
                },
            };
            var store2 = {
                __handleAction__: function(action) {
                    expect(oneCalled).toBe(false);
                    expect(twoCalled).toBe(false);
                    twoCalled = true;
                },
            };
            var dispatcher = new Dispatcher({
                Store1: store1,
                Store2: store2,
            });

            dispatcher.dispatch({type: 'foo'});
            expect(oneCalled).toBe(true);
            expect(twoCalled).toBe(true);
        });
    });
});
