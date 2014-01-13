var clientApp, HapiError;
var Moonboots = require('moonboots');

var exports = module.exports = {
    jsHandler: function (request, reply) {
        if (!clientApp) {
            return reply(new HapiError.internal('No clientApp'));
        }
        clientApp.jsSource(function _getJsSource(err, css) {
            if (err) {
                return reply(new HapiError.internal('No js source'));
            }
            reply(css).header('content-type', 'text/javascript; charset=utf-8');
        });
    },
    cssHandler: function (request, reply) {
        if (!clientApp) {
            return reply(new HapiError.internal('No clientApp'));
        }
        clientApp.cssSource(function _getCssSource(err, css) {
            if (err) {
                return reply(new HapiError.internal('No css source'));
            }
            reply(css).header('content-type', 'text/css; charset=utf-8');
        });
    },
    mainHandler: function (request, reply) {
        if (!clientApp) {
            return reply(new HapiError.internal('No clientApp'));
        }
        clientApp.getResult('html', function _getHtmlResult(err, html) {
            if (err) {
                return reply(new HapiError.internal('No html result'));
            }
            reply(html);
        });
    },
    register: function (plugin, options, next) {
        var extendedConfig;
        var config = {};
        HapiError = plugin.hapi.Error;
        clientApp = new Moonboots(options);
        extendedConfig = clientApp.getConfig('hapi') || {};
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
                handler: exports.jsHandler,
                config: config
            });
            plugin.route({
                method: 'get',
                path: '/' + encodeURIComponent(clientApp.cssFileName()),
                handler: exports.cssHandler,
                config: config
            });
            plugin.route({
                method: 'get',
                path: clientApp.getConfig('appPath') || '/{client*}',
                handler: exports.mainHandler,
                config: extendedConfig
            });
            plugin.helper('jsHandler', exports.jsHandler);
            plugin.helper('cssHandler', exports.cssHandler);
            plugin.helper('mainHandler', exports.mainHandler);
            next();
        });
    }
};
