var Hapi = require('hapi');
var MoonbootsHapi = require('./');

var moonboots_options = {
    main: __dirname + '/sample/app/app.js',
    stylesheets: [
        __dirname + '/sample/stylesheets/style.css'
    ]
};

var config = {
    moonboots: moonboots_options,
    appPath: '/app/{appPath*}'
};

var server = new Hapi.Server();
server.connection({ host: 'localhost', port: 3000 });

server.on('log', function (event, tags) {
    console.log(event);
});

server.route({
    method: 'get',
    path: '/',
    handler: function (request, reply) {
        reply('Redirecting to clientside app...').redirect('/app');
    }
});

server.register({
    register: MoonbootsHapi,
    options: config
}, function (err) {
    if (err) throw err;

    server.start(function () {
        console.log('Sample app running at: http://localhost:3000');
    });
});

