/* Test that the routes return expected data */
var Lab = exports.lab = require('lab').script();
var Expect = require('code').expect;
var server, appSource, jsSource, cssSource;
var async = require('async');
var Hapi = require('hapi');
var Moonboots = require('moonboots');
var MoonbootsHapi = require('..');

var moonboots_hapi_options = {
    developmentMode: true,
    moonboots: {
        main: __dirname + '/../sample/app/app.js',
        stylesheets: [
            __dirname + '/../sample/stylesheets/style.css'
        ]
    }
};
var moonboots_options = {
    main: __dirname + '/../sample/app/app.js',
    cssFileName: 'app',
    developmentMode: true,
    stylesheets: [
        __dirname + '/../sample/stylesheets/style.css'
    ]
};

var moonboots;

Lab.experiment('default happy path tests', function () {
    Lab.before(function (done) {
        moonboots = new Moonboots(moonboots_options);
        moonboots.on('ready', function () {
          server = new Hapi.Server();
          server.connection({ host: 'localhost', port: 3001 });
          async.parallel({
            plugin: function (next) {
              server.register([{
                register: MoonbootsHapi,
                options: moonboots_hapi_options
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
    });
    Lab.test('serves app where expected', function (done) {
        server.inject({
            method: 'GET',
            url: '/app'
        }, function _getApp(res) {
            Expect(res.statusCode).to.equal(200);
            Expect(res.payload).to.equal(appSource);
            done();
        });
    });
    Lab.test('serves js where expected', function (done) {
        server.inject({
            method: 'GET',
            url: '/app.nonCached.js'
        }, function _getJs(res) {
            Expect(res.statusCode).to.equal(200);
            Expect(res.payload).to.equal(jsSource);
            done();
        });
    });
    Lab.test('serves css where expected',  function (done) {
        server.inject({
            method: 'GET',
            url: '/app.nonCached.css'
        }, function _getJs(res) {
            Expect(res.statusCode).to.equal(200);
            Expect(res.payload).to.equal(cssSource);
            done();
        });
    });
    Lab.test('clientConfig is exposed', function (done) {
        server.plugins.moonboots_hapi.clientConfig(function (config) {
            Expect(config).to.equal(moonboots_hapi_options);
            done();
        });
    });
    Lab.test('clientApp is exposed', function (done) {
        server.plugins.moonboots_hapi.clientApp(function (clientApp) {
            Expect(clientApp).to.be.instanceOf(Moonboots);
            done();
        });
    });
});
