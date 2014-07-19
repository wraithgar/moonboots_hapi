/* Test that the template argument is observed */
var Lab = require('lab');
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
        server = new Hapi.Server('localhost', 3001, serverOptions);
        server.pack.register([{
            plugin: MoonbootsHapi,
            options: moonboots_hapi_options
        }], done);
    });
    Lab.test('template is served where expected', function (done) {
        server.inject({
            method: 'GET',
            url: '/'
        }, function (res) {
            Lab.expect(res.statusCode, 'response code').to.equal(200);
            Lab.expect(res.payload, 'response body').to.equal('<div>app.nonCached.js</div><span>app.nonCached.js</span>');
            done();
        });
    });
});
