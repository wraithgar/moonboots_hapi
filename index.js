var Moonboots = require('moonboots');
var async = require('async');


exports.register = function (plugin, options, next) {
    var HapiError = plugin.hapi.Error;
    var clientApps = (options instanceof Array) ? options : [options];

    async.forEach(clientApps, function (options, cb) {
        var clientApp = new Moonboots(options);
        var extendedConfig = clientApp.getConfig('hapi') || {};
        var config = {};
        if (!clientApp.getConfig('developmentMode')) {
            config.cache = {
                expiresIn: clientApp.getConfig('cachePeriod')
            };
            extendedConfig.cache = extendedConfig.cache || {};
            extendedConfig.cache.expiresIn = clientApp.getConfig('cachePeriod');
        }
        clientApp.on('ready', function () {
            plugin.route({
                method: 'get',
                path: '/' + encodeURIComponent(clientApp.jsFileName()),
                handler: function _jsFileHandler(request, reply) {
                    clientApp.jsSource(function _getJsSource(err, css) {
                        if (err) {
                            return reply(new HapiError.internal('No js source'));
                        }
                        reply(css).header('content-type', 'text/javascript; charset=utf-8');
                    });
                },
                config: config
            });
            plugin.route({
                method: 'get',
                path: '/' + encodeURIComponent(clientApp.cssFileName()),
                handler: function _cssFileHandler(request, reply) {
                    clientApp.cssSource(function _getCssSource(err, css) {
                        if (err) {
                            return reply(new HapiError.internal('No css source'));
                        }
                        reply(css).header('content-type', 'text/css; charset=utf-8');
                    });
                },
                config: config
            });
            plugin.route({
                method: 'get',
                path: clientApp.getConfig('appPath') || '/{client*}',
                handler: function _appHandler(request, reply) {
                    clientApp.getResult('html', function _getHtmlResult(err, html) {
                        if (err) {
                            return reply(new HapiError.internal('No html result'));
                        }
                        reply(html);
                    });
                },
                config: extendedConfig
            });
            cb();
        });
    }, function () {
        // expose all apps to other handlers
        plugin.helper('getMoonbootsApps', function () {
            return clientApps;
        });
        next();
    });
};
