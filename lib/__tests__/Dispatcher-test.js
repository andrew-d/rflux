jest.dontMock("lodash");
jest.dontMock("../Dispatcher.js");

var Dispatcher = require('../Dispatcher.js');

describe("Dispatcher", function() {
    describe('constructor', function() {
        it('will throw when passed a bad specification', function() {
            expect(function() {
                new Dispatcher(1234);
            }).toThrow();
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
                }).toThrow();
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

        it('will disallow invalid dispatches', function() {
            expect(function() {
                dispatcher.dispatch(1234);
            }).toThrow();
        });
    });
});
