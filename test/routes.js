/* Test that the routes return expected data */
var Lab = exports.lab = require('lab').script();
var Expect = require('code').expect;
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
        server = new Hapi.Server();
        server.connection({ host: 'localhost', port: 3001 });
        async.parallel({
            plugin: function (next) {
                server.register([{
                    register: MoonbootsHapi,
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
            Expect(res.statusCode, 'response code').to.equal(200);
            Expect(res.payload, 'response body').to.equal(appSource);
            done();
        });
    });
    Lab.test('serves js where expected', function (done) {
        server.inject({
            method: 'GET',
            url: '/moonboots-hapi-js.nonCached.js'
        }, function _getJs(res) {
            Expect(res.statusCode, 'response code').to.equal(200);
            Expect(res.payload, 'response body').to.equal(jsSource);
            done();
        });
    });
    Lab.test('serves css where expected',  function (done) {
        server.inject({
            method: 'GET',
            url: '/moonboots-hapi-css.nonCached.css'
        }, function _getJs(res) {
            Expect(res.statusCode, 'response code').to.equal(200);
            Expect(res.payload, 'response body').to.equal(cssSource);
            done();
        });
    });
});

Lab.experiment('disabling routes', function () {
    Lab.before(function (done) {
        server = new Hapi.Server();
        server.connection({ host: 'localhost', port: 3001 });
        async.parallel({
            plugin: function (next) {
                server.register([{
                    register: MoonbootsHapi,
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
            Expect(res.statusCode, 'response code').to.equal(404);
            done();
        });
    });
    Lab.test('serves js where expected', function (done) {
        server.inject({
            method: 'GET',
            url: '/moonboots-hapi-js.nonCached.js'
        }, function _getJs(res) {
            Expect(res.statusCode, 'response code').to.equal(200);
            Expect(res.payload, 'response body').to.equal(jsSource);
            done();
        });
    });
    Lab.test('serves css where expected',  function (done) {
        server.inject({
            method: 'GET',
            url: '/moonboots-hapi-css.nonCached.css'
        }, function _getJs(res) {
            Expect(res.statusCode, 'response code').to.equal(200);
            Expect(res.payload, 'response body').to.equal(cssSource);
            done();
        });
    });
});
