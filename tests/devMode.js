/* Test for developmentMode flags doing what they should */
var prodServer, devServer, jsPath, cssPath;
var async = require('async');
var Hapi = require('hapi');
var Moonboots = require('moonboots');
var prod_options = {
    appPath: '/app',
    jsFileName: 'moonboots-hapi-js',
    cssFileName: 'moonboots-hapi-css',
    main: __dirname + '/../sample/app/app.js',
    stylesheets: [
        __dirname + '/../sample/stylesheets/style.css'
    ]
};

var dev_options = {
    developmentMode: true,
    appPath: '/app',
    jsFileName: 'moonboots-hapi-js',
    cssFileName: 'moonboots-hapi-css',
    main: __dirname + '/../sample/app/app.js',
    stylesheets: [
        __dirname + '/../sample/stylesheets/style.css'
    ]
};
var devMoonboots = new Moonboots(dev_options);
var prodMoonboots = new Moonboots(prod_options);

module.exports = {
    setUp: function (done) {
        prodServer = new Hapi.Server('localhost', 3001);
        devServer = new Hapi.Server('localhost', 3002);
        async.parallel({
            prod: function (next) {
                prodServer.pack.require({'..': prod_options}, next);
            },
            dev: function (next) {
                devServer.pack.require({'..': dev_options}, next);
            }
        }, function (err) {
            if (err) {
                process.stderr.write('Unable to setUp tests', err, '\n');
                process.exit(1);
            }
            done();
        });
    },
    tearDown: function (done) {
        done();
    },
    devApp: function (test) {
        test.expect(1);
        devServer.inject({
            method: 'GET',
            url: devMoonboots.getConfig('appPath')
        }, function _devApp(res) {
            test.equal(res.headers['cache-control'], 'no-cache');
            test.done();
        });
    },
    devJs: function (test) {
        test.expect(1);
        devServer.inject({
            method: 'GET',
            url: '/' + devMoonboots.jsFileName()
        }, function _devJs(res) {
            test.equal(res.headers['cache-control'], 'no-cache');
            test.done();
        });
    },
    devCss: function (test) {
        test.expect(1);
        devServer.inject({
            method: 'GET',
            url: '/' + devMoonboots.cssFileName()
        }, function _devCss(res) {
            test.equal(res.headers['cache-control'], 'no-cache');
            test.done();
        });
    },
    prodApp: function (test) {
        test.expect(1);
        prodServer.inject({
            method: 'GET',
            url: '/' + prodMoonboots.getConfig('appPath')
        }, function _prodApp(res) {
            test.equal(res.headers['cache-control'], 'no-cache');
            test.done();
        });
    },
    prodJs: function (test) {
        test.expect(1);
        prodServer.inject({
            method: 'GET',
            url: '/' + prodMoonboots.jsFileName()
        }, function _prodJs(res) {
            test.equal(res.headers['cache-control'], 'max-age=31104000, must-revalidate');
            test.done();
        });
    },
    prodCss: function (test) {
        test.expect(1);
        prodServer.inject({
            method: 'GET',
            url: '/' + prodMoonboots.cssFileName()
        }, function _prodCss(res) {
            test.equal(res.headers['cache-control'], 'max-age=31104000, must-revalidate');
            test.done();
        });
    }
};
