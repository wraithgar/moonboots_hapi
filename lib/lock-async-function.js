//lock-async-function

//Takes a function (which takes a single callback argument)
//and ensures it's only ever run once at a time.
//
//The initial, and dubsequent calls, to the function while it's locked will receive
//the result to it's callback when the initial current run completes.

module.exports = function lockAsyncFunction(fn) {
    var locked = false;
    var cbs = [];

    return function (cb) {
        cbs.push(cb);

        if (!locked) {
            locked = true;
            fn(function () {
                var args = arguments;
                cbs.forEach(function (cb) {
                    cb.apply(null, args);
                });
                locked = false;
            });
        }
    };
};
