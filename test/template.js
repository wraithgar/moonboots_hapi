/* Test that the template argument is observed */
var Lab = exports.lab = require('lab').script();
var Expect = require('code').expect;
var server;
var Hapi = require('hapi');
var MoonbootsHapi = require('..');
var Jade = require('jade');
var moonboots_hapi_options = {
    developmentMode: true,
    appTemplate: 'index',
    moonboots: {
        main: __dirname + '/../sample/app/app.js',
        stylesheets: [
            __dirname + '/../sample/stylesheets/style.css'
        ]
    }
};

var serverOptions = {
    views: {
        engines: {
            jade: Jade
        },
        path: 'sample/views'
    }
};
Lab.experiment('template', function () {
    Lab.before(function (done) {
        server = new Hapi.Server();
        server.views(serverOptions.views);
        server.connection({ host: 'localhost', port: 3001 });
        server.register([{
            register: MoonbootsHapi,
            options: moonboots_hapi_options
        }], done);
    });
    Lab.test('template is served where expected', function (done) {
        server.inject({
            method: 'GET',
            url: '/'
        }, function (res) {
            Expect(res.statusCode, 'response code').to.equal(200);
            Expect(res.payload, 'response body').to.equal('<div>app.nonCached.js</div><span>app.nonCached.js</span>');
            done();
        });
    });
});
