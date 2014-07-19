/* Test that the routes return expected data */
var Lab = require('lab');
var server, appSource, jsSource, cssSource;
var async = require('async');
var Hapi = require('hapi');
var Moonboots = require('moonboots');
var MoonbootsHapi = require('..');
var options = {
    appPath: '/app',
    moonboots: {
        jsFileName: 'moonboots-hapi-js',
        cssFileName: 'moonboots-hapi-css',
        main: __dirname + '/../sample/app/app.js',
        developmentMode: true,
        stylesheets: [
            __dirname + '/../sample/stylesheets/style.css'
        ]
    }
};

var no_html = {
    appPath: '/app',
    routes: {html: false},
    moonboots: {
        jsFileName: 'moonboots-hapi-js',
        cssFileName: 'moonboots-hapi-css',
        main: __dirname + '/../sample/app/app.js',
        developmentMode: true,
        stylesheets: [
            __dirname + '/../sample/stylesheets/style.css'
        ]
    }
};

var moonboots = new Moonboots(options.moonboots);

Lab.experiment('routes', function () {
    Lab.before(function (done) {
        server = new Hapi.Server('localhost', 3001);
        async.parallel({
            plugin: function (next) {
                server.pack.register([{
                    plugin: MoonbootsHapi,
                    options: options
                }], next);
            },
            getSource: function (next) {
                appSource = moonboots.htmlSource();
                next();
            },
            getJs: function (next) {
                moonboots.jsSource(function _getJsSource(err, js) {
                    jsSource = js;
                    next(err);
                });
            },
            getCss: function (next) {
                moonboots.cssSource(function _getCssSource(err, css) {
                    cssSource = css;
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
    Lab.test('serves app where expected', function (done) {
        server.inject({
            method: 'GET',
            url: '/app'
        }, function _getApp(res) {
            Lab.expect(res.statusCode, 'response code').to.equal(200);
            Lab.expect(res.payload, 'response body').to.equal(appSource, 'application source');
            done();
        });
    });
    Lab.test('serves js where expected', function (done) {
        server.inject({
            method: 'GET',
            url: '/moonboots-hapi-js.nonCached.js'
        }, function _getJs(res) {
            Lab.expect(res.statusCode, 'response code').to.equal(200);
            Lab.expect(res.payload, 'response body').to.equal(jsSource, 'js source');
            done();
        });
    });
    Lab.test('serves css where expected',  function (done) {
        server.inject({
            method: 'GET',
            url: '/moonboots-hapi-css.nonCached.css'
        }, function _getJs(res) {
            Lab.expect(res.statusCode, 'response code').to.equal(200);
            Lab.expect(res.payload, 'response body').to.equal(cssSource, 'css source');
            done();
        });
    });
});

Lab.experiment('disabling routes', function () {
    Lab.before(function (done) {
        server = new Hapi.Server('localhost', 3001);
        async.parallel({
            plugin: function (next) {
                server.pack.register([{
                    plugin: MoonbootsHapi,
                    options: no_html
                }], next);
            },
            getJs: function (next) {
                moonboots.jsSource(function _getJsSource(err, js) {
                    jsSource = js;
                    next(err);
                });
            },
            getCss: function (next) {
                moonboots.cssSource(function _getCssSource(err, css) {
                    cssSource = css;
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
    Lab.test('does not serve app where not expected', function (done) {
        server.inject({
            method: 'GET',
            url: '/app'
        }, function _getApp(res) {
            Lab.expect(res.statusCode, 'response code').to.equal(404);
            done();
        });
    });
    Lab.test('serves js where expected', function (done) {
        server.inject({
            method: 'GET',
            url: '/moonboots-hapi-js.nonCached.js'
        }, function _getJs(res) {
            Lab.expect(res.statusCode, 'response code').to.equal(200);
            Lab.expect(res.payload, 'response body').to.equal(jsSource, 'js source');
            done();
        });
    });
    Lab.test('serves css where expected',  function (done) {
        server.inject({
            method: 'GET',
            url: '/moonboots-hapi-css.nonCached.css'
        }, function _getJs(res) {
            Lab.expect(res.statusCode, 'response code').to.equal(200);
            Lab.expect(res.payload, 'response body').to.equal(cssSource, 'css source');
            done();
        });
    });
});
