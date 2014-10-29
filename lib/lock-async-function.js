//lock-async-function

//Takes a function (which takes a single callback argument)
//and ensures it's only ever run once at a time.
//
//The initial, and subsequent calls, to the function while it's locked will receive
//the result to its callback when the initial run completes.

module.exports = function lockAsyncFunction(fn) {
    var locked = false;
    var cbs = [];

    return function _lockedAyncFunction(cb) {
        cbs.push(cb);

        if (!locked) {
            locked = true;
            fn(function _lockAsyncCallbackWrapper() {
                var args = arguments;
                cbs.forEach(function _eachQueuedCallback(cb) {
                    cb.apply(null, args);
                });
                locked = false;
            });
        }
    };
};
