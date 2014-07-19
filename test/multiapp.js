/* Test that the routes return expected data */
var Lab = require('lab');
var server, appSource1, jsSource1, cssSource1, appSource2, jsSource2, cssSource2;
var async = require('async');
var Hapi = require('hapi');
var Moonboots = require('moonboots');
var MoonbootsHapi = require('..');

var options1 = {
    appPath: '/app1',
    moonboots: {
        jsFileName: 'moonboots-hapi-js1',
        cssFileName: 'moonboots-hapi-css1',
        main: __dirname + '/../sample/app/app.js',
        developmentMode: true,
        stylesheets: [
            __dirname + '/../sample/stylesheets/style.css'
        ]
    }
};

var options2 = {
    appPath: '/app2',
    moonboots: {
        jsFileName: 'moonboots-hapi-js2',
        cssFileName: 'moonboots-hapi-css2',
        main: __dirname + '/../sample/app/app.js',
        developmentMode: true,
        stylesheets: [
            __dirname + '/../sample/stylesheets/style.css'
        ]
    }
};

var moonboots1 = new Moonboots(options1.moonboots);
var moonboots2 = new Moonboots(options2.moonboots);

Lab.experiment('multiple apps happy path', function () {
    Lab.before(function (done) {
        server = new Hapi.Server('localhost', 3001);
        async.parallel({
            plugin: function (next) {
                server.pack.register([{
                    plugin: MoonbootsHapi,
                    options: [options1, options2]
                }], next);
            },
            getSource: function (next) {
                appSource1 = moonboots1.htmlSource();
                appSource2 = moonboots2.htmlSource();
                next();
            },
            getJs: function (next) {
                moonboots1.jsSource(function _getJsSource(err, js) {
                    jsSource1 = js;
                    next(err);
                });
            },
            getJs2: function (next) {
                moonboots2.jsSource(function _getJsSource(err, js) {
                    jsSource2 = js;
                    next(err);
                });
            },
            getCss: function (next) {
                moonboots1.cssSource(function _getCssSource(err, css) {
                    cssSource1 = css;
                    next(err);
                });
            },
            getCss2: function (next) {
                moonboots2.cssSource(function _getCssSource(err, css) {
                    cssSource2 = css;
                    next(err);
                });
            }
        }, function (err) {
            if (err) {
                process.stderr.write('Unable to setUp tests', err, '\n');
                process.exit(1);
            }
            done();
        });
    });
    Lab.test('serves app1 where expected', function (done) {
        server.inject({
            method: 'GET',
            url: '/app1'
        }, function _getApp(res) {
            Lab.expect(res.statusCode, 'response code').to.equal(200);
            Lab.expect(res.payload, 'response body').to.equal(appSource1, 'application source');
            done();
        });
    });
    Lab.test('serves app2 where expected', function (done) {
        server.inject({
            method: 'GET',
            url: '/app2'
        }, function _getApp(res) {
            Lab.expect(res.statusCode, 'response code').to.equal(200);
            Lab.expect(res.payload, 'response body').to.equal(appSource2, 'application source');
            done();
        });
    });
    Lab.test('serves app1 js where expected', function (done) {
        server.inject({
            method: 'GET',
            url: '/moonboots-hapi-js1.nonCached.js'
        }, function _getJs(res) {
            Lab.expect(res.statusCode, 'response code').to.equal(200);
            Lab.expect(res.payload, 'response body').to.equal(jsSource1, 'js source');
            done();
        });
    });
    Lab.test('serves app2 js where expected', function (done) {
        server.inject({
            method: 'GET',
            url: '/moonboots-hapi-js2.nonCached.js'
        }, function _getJs(res) {
            Lab.expect(res.statusCode, 'response code').to.equal(200);
            Lab.expect(res.payload, 'response body').to.equal(jsSource2, 'js source');
            done();
        });
    });
    Lab.test('serves app1 css where expected', function (done) {
        server.inject({
            method: 'GET',
            url: '/moonboots-hapi-css1.nonCached.css'
        }, function _getJs(res) {
            Lab.expect(res.statusCode, 'response code').to.equal(200);
            Lab.expect(res.payload, 'response body').to.equal(cssSource1, 'css source');
            done();
        });
    });
    Lab.test('serves app1 css where expected', function (done) {
        server.inject({
            method: 'GET',
            url: '/moonboots-hapi-css2.nonCached.css'
        }, function _getJs(res) {
            Lab.expect(res.statusCode, 'response code').to.equal(200);
            Lab.expect(res.payload, 'response body').to.equal(cssSource2, 'css source');
            done();
        });
    });
    Lab.test('app1 clientConfig is exposed', function (done) {
        server.plugins.moonboots_hapi.clientConfig(0, function (config) {
            Lab.expect(config, 'client config').to.equal(options1, 'moonboots-hapi config');
            done();
        });
    });
    Lab.test('app2 clientConfig is exposed', function (done) {
        server.plugins.moonboots_hapi.clientConfig(1, function (config) {
            Lab.expect(config, 'client config').to.equal(options2, 'moonboots-hapi config');
            done();
        });
    });
    Lab.test('app1 clientApp is exposed', function (done) {
        server.plugins.moonboots_hapi.clientApp(0, function (clientApp) {
            Lab.expect(clientApp, 'client app').to.be.instanceOf(Moonboots);
            //TODO confirm this is the right app maybe?
            done();
        });
    });
    Lab.test('app2 clientApp is exposed', function (done) {
        server.plugins.moonboots_hapi.clientApp(1, function (clientApp) {
            Lab.expect(clientApp, 'client app').to.be.instanceOf(Moonboots);
            //TODO confirm this is the right app maybe?
            done();
        });
    });
});
