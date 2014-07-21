jest.dontMock("../Store.js");

var Store = require("../Store.js");

describe("Store", function() {
    describe("constructor", function() {
        it("will save the options on the object", function() {
            var opts = {foo: 'bar'};
            var s = new Store(opts);

            expect(s.options).toBe(opts);
        });
    });

    describe("__addAction__", function() {
        var s = new Store();

        it("will throw on an invalid handler", function() {
            var f = function() {
                s.__addAction__('foo', 123);
            }
            expect(f).toThrow();
        });

        it("will add a handler without errors", function() {
            var dummy = function(){};
            var f = function() {
                s.__addAction__('foo', dummy);
            }

            expect(f).not.toThrow();
        });
    });

    describe("__handleAction__", function() {
        var s;
        var mockHandler;

        beforeEach(function() {
            s = new Store();
            mockHandler = jest.genMockFunction();
            s.__addAction__("foo", mockHandler);
        });

        it("will call a defined handler", function() {
            var payload = {};

            s.__handleAction__({
                type: 'foo',
                payload: payload,
            });

            expect(mockHandler.mock.calls.length).toBe(1);
            expect(mockHandler.mock.calls[0][0]).toBe(payload);
            expect(mockHandler.mock.calls[0][1]).toBe('foo');
        });
    });
});
