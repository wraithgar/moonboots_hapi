var Hapi = require('hapi');
var moonboots_options = {
    developmentMode: true,
    main: __dirname + '/sample/app/app.js',
    stylesheets: [
        __dirname + '/sample/stylesheets/style.css'
    ]
};

var config = {
    moonboots: moonboots_options,
    appPath: '/app/{appPath*}'
};

var server = new Hapi.Server('localhost', 3000);

server.route({
    method: 'get',
    path: '/',
    handler: function (request, reply) {
        reply('Redirecting to clientside app...').redirect('/app');
    }
});

server.pack.require({ '.': config }, function (err) {
    if (err) throw err;

    server.start(function () {
        console.log('Sample app running at: http://localhost:3000');
    });
});

