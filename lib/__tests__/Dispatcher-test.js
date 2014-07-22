jest.dontMock("../Dispatcher.js");

var Dispatcher = require('../Dispatcher.js');

describe("Dispatcher", function() {
    describe('dispatch', function() {
        var store1, store2, dispatcher;

        beforeEach(function() {
            store1 = {__handleAction__: jest.genMockFunction()};
            store2 = {__handleAction__: jest.genMockFunction()};
            dispatcher = new Dispatcher({Store1: store1, Store2: store2});
        });

        it('will dispatch an action to all stores', function() {
            var action = {type: 'a', payload: 'b'};
            dispatcher.dispatch(action);

            expect(store1.__handleAction__.mock.calls.length).toBe(1);
            expect(store2.__handleAction__.mock.calls.length).toBe(1);

            expect(store1.__handleAction__.mock.calls[0][0]).toBe(action);
            expect(store2.__handleAction__.mock.calls[0][0]).toBe(action);
        });
    });
});
