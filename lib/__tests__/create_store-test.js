jest.dontMock("../create_store.js");

var createStore = require('../create_store.js');

describe('create_store', function() {
    it('will disallow reserved keys', function() {
        // TODO
    });

    it('will call the initialization function', function() {
        var initMock = jest.genMockFunction();

        var ctor = createStore({
            initialize: initMock,
        });
        var opts = {};

        var s = new ctor(opts);

        expect(initMock.mock.calls.length).toBe(1);
        expect(initMock.mock.calls[0][0]).toBe(opts);
    });

    it('will call getInitialState to get the state', function() {
        var gisMock = jest.genMockFunction();

        var state = {}
        gisMock.mockReturnValueOnce(state);

        var ctor = createStore({
            getInitialState: gisMock,
        });
        var s = new ctor();

        expect(gisMock.mock.calls.length).toBe(1);
        expect(s.state).toBe(state);
    });

    // TODO: test that functions in the spec are bound
});
