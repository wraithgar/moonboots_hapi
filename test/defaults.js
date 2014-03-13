/* Test that the routes return expected data */
var Lab = require('lab');
var server, appSource, jsSource, cssSource;
var async = require('async');
var Hapi = require('hapi');
var Moonboots = require('moonboots');
var moonboots_hapi_options = {
    appPath: '/myapp/{clientPath*}',
    moonboots: {
        main: __dirname + '/../sample/app/app.js',
        developmentMode: true,
        stylesheets: [
            __dirname + '/../sample/stylesheets/style.css'
        ]
    }
};
var moonboots_options = {
    jsFileName: 'myapp',
    cssFileName: 'myapp',
    main: __dirname + '/../sample/app/app.js',
    developmentMode: true,
    stylesheets: [
        __dirname + '/../sample/stylesheets/style.css'
    ]
};

var moonboots = new Moonboots(moonboots_options);

Lab.experiment('defaults', function () {
    Lab.before(function (done) {
        server = new Hapi.Server('localhost', 3001);
        async.parallel({
            plugin: function (next) {
                server.pack.require({ '..': moonboots_hapi_options }, next);
            },
            getSource: function (next) {
                moonboots.getResult('html', function _getSource(err, html) {
                    appSource = html;
                    next(err);
                });
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
    Lab.test('app', function (done) {
        server.inject({
            method: 'GET',
            url: '/myapp'
        }, function _getApp(res) {
            Lab.expect(res.statusCode).to.equal(200);
            Lab.expect(res.payload).to.equal(appSource);
            done();
        });
    });
    Lab.test('js', function (done) {
        server.inject({
            method: 'GET',
            url: '/myapp.js'
        }, function _getJs(res) {
            Lab.expect(res.statusCode).to.equal(200);
            Lab.expect(res.payload).to.equal(jsSource);
            done();
        });
    });
    Lab.test('css',  function (done) {
        server.inject({
            method: 'GET',
            url: '/myapp.css'
        }, function _getJs(res) {
            Lab.expect(res.statusCode).to.equal(200);
            Lab.expect(res.payload).to.equal(cssSource);
            done();
        });
    });
    Lab.test('clientConfig', function (done) {
        server.plugins.moonboots_hapi.clientConfig(0, function (config) {
            Lab.expect(config).to.equal(moonboots_hapi_options);
            done();
        });
    });
    Lab.test('clientApp', function (done) {
        server.plugins.moonboots_hapi.clientApp(0, function (clientApp) {
            Lab.expect(clientApp).to.be.instanceOf(Moonboots);
            done();
        });
    });
});
