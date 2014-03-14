var Moonboots = require('moonboots');
var async = require('async');

function setDefaults(options, next) {
    var baseAppPath;
    options.moonboots = options.moonboots || {};
    if (!options.appPath) {
        options.appPath = '/{client*}';
    }
    baseAppPath = options.appPath.replace(/\/{.*}$/, '').slice(1);
    if (!baseAppPath) {
        baseAppPath = 'app';
    }

    if (!options.moonboots.jsFileName) {
        options.moonboots.jsFileName = baseAppPath;
    }
    if (!options.moonboots.cssFileName) {
        options.moonboots.cssFileName = baseAppPath;
    }
    return options;
}

exports.register = function (plugin, options, next) {
    var HapiError = plugin.hapi.Error;
    var clientApps = [];
    var clientConfigs = (options instanceof Array) ? options : [options];

    async.each(clientConfigs, function _eachApp(clientConfig, cb) {
        var appOptions = setDefaults(clientConfig);
        var servers = (appOptions.labels) ? plugin.select(appOptions.labels) : plugin;
        var clientApp = new Moonboots(appOptions.moonboots);
        clientApps.push(clientApp);
        /* App config */
        appOptions.appConfig = appOptions.appConfig || {};
        if (appOptions.appConfig) {
            appOptions.appConfig.description = appOptions.appConfig.description || 'Main Moonboots app';
            appOptions.appConfig.notes = appOptions.appConfig.notes || 'Returns the compiled Moonboots app';
            appOptions.appConfig.tags = appOptions.appConfig.tags || ['moonboots', 'app'];
            appOptions.appConfig.bind = appOptions.appConfig.bind || clientApp;
            appOptions.appConfig.handler = appOptions.appConfig.handler ||
                function appRouteHandler(request, reply) {
                    clientApp.getResult('html', function _getHtmlResult(err, html) {
                        if (err) {
                            return reply(new HapiError.internal('No html result'));
                        }
                        // Set cache-control explicitly to no-store
                        // this is so chrome doesn't trust it's cache
                        // even on back button presses.
                        reply(html).header('cache-control', 'no-store');
                    });
                };
        }

        /* JS config */
        appOptions.jsConfig = appOptions.jsConfig || {};
        appOptions.jsConfig.description = appOptions.jsConfig.description || 'Moonboots JS source';
        appOptions.jsConfig.notes = appOptions.jsConfig.notes || 'Returns the compiled JS from moonboots';
        appOptions.jsConfig.tags = appOptions.jsConfig.tags || ['moonboots', 'js'];
        appOptions.jsConfig.handler = appOptions.jsConfig.handler ||
            function jsRouteHandler(request, reply) {
                clientApp.jsSource(function _getJsSource(err, css) {
                    if (err) {
                        return reply(new HapiError.internal('No js source'));
                    }
                    reply(css).header('content-type', 'text/javascript; charset=utf-8');
                });
            };

        /* CSS config */
        appOptions.cssConfig = appOptions.cssConfig || {};
        appOptions.cssConfig.description = appOptions.cssConfig.description || 'Moonboots CSS source';
        appOptions.cssConfig.notes = appOptions.cssConfig.notes || 'Returns the compiled CSS from moonboots';
        appOptions.cssConfig.tags = appOptions.cssConfig.tags || ['moonboots', 'css'];
        appOptions.cssConfig.handler = appOptions.cssConfig.handler ||
            function cssRouteHandler(request, reply) {
                clientApp.cssSource(function _getCssSource(err, css) {
                    if (err) {
                        return reply(new HapiError.internal('No css source'));
                    }
                    reply(css).header('content-type', 'text/css; charset=utf-8');
                });
            };
        if (!clientApp.getConfig('developmentMode')) {
            appOptions.jsConfig.cache = {
                expiresIn: clientApp.getConfig('cachePeriod')
            };
            appOptions.cssConfig.cache = {
                expiresIn: clientApp.getConfig('cachePeriod')
            };
        }
        clientApp.on('ready', function _clientAppReady() {
            servers.route({
                method: 'get',
                path: '/' + encodeURIComponent(clientApp.jsFileName()),
                config: appOptions.jsConfig
            });
            servers.route({
                method: 'get',
                path: '/' + encodeURIComponent(clientApp.cssFileName()),
                config: appOptions.cssConfig
            });
            servers.route({
                method: 'get',
                path: appOptions.appPath,
                config: appOptions.appConfig
            });
            cb();
        });
    }, function () {
        plugin.expose('clientConfig', function (key, cb) {
            return cb(clientConfigs[key]);
        });
        plugin.expose('clientApp', function (key, cb) {
            return cb(clientApps[key]);
        });
        next();
    });
};
