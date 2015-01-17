var Moonboots = require('moonboots');
var lockAsyncFunction = require('./lib/lock-async-function');

function setDefaults(options, next) {
    var baseAppPath;
    options.moonboots = options.moonboots || {};
    options.routes = options.routes || {};
    if (!options.appPath) {
        options.appPath = '/{client*}';
    }
    baseAppPath = options.appPath.replace(/\/{.*}$/, '').slice(1);
    if (!baseAppPath) {
        baseAppPath = 'app';
    }

    if (options.routes.js === undefined) {
        options.routes.js = true;
    }
    if (options.routes.css === undefined) {
        options.routes.css = true;
    }
    if (options.routes.html === undefined) {
        options.routes.html = true;
    }
    if (!options.moonboots.jsFileName) {
        options.moonboots.jsFileName = baseAppPath;
    }
    if (!options.moonboots.cssFileName) {
        options.moonboots.cssFileName = baseAppPath;
    }
    if (!options.logLevel) {
        options.logLevel = 'debug';
    }
    if (options.developmentMode) {
        options.moonboots.developmentMode = true;
    }
    if (!options.cachePeriod) {
        options.cachePeriod = 86400000 * 360; //one year
    }
    return options;
}

exports.register = function (plugin, clientConfig, next) {
    var clientApp;
    var appOptions = setDefaults(clientConfig);
    var servers = (appOptions.labels) ? plugin.select(appOptions.labels) : plugin;
    if (appOptions.logLevel !== 'none') {
        plugin.log(['plugin', 'moonboots-hapi', appOptions.logLevel], {message: 'creating moonboots app', appPath: appOptions.appPath});
    }
    clientApp = new Moonboots(appOptions.moonboots);

    /* App config */
    appOptions.appConfig = appOptions.appConfig || {};
    appOptions.appConfig.description = appOptions.appConfig.description || 'Main Moonboots app';
    appOptions.appConfig.notes = appOptions.appConfig.notes || 'Returns the compiled Moonboots app';
    appOptions.appConfig.tags = appOptions.appConfig.tags || ['moonboots', 'app'];
    appOptions.appConfig.bind = appOptions.appConfig.bind || clientApp;
    if (!appOptions.appConfig.handler) {
        if (appOptions.appTemplate) {
            appOptions.appConfig.handler = function appRouteTemplateHandler(request, reply) {
                var htmlContext = clientApp.htmlContext();
                return reply.view(appOptions.appTemplate, htmlContext);
            };
        } else {
            appOptions.appConfig.handler =  function appRouteDefaultHandler(request, reply) {
                var htmlSource = clientApp.htmlSource();
                reply(htmlSource).header('cache-control', 'no-store');
            };
        }
    }


    /* JS config */
    var getJsSource = lockAsyncFunction(clientApp.jsSource.bind(clientApp));

    appOptions.jsConfig = appOptions.jsConfig || {};
    appOptions.jsConfig.description = appOptions.jsConfig.description || 'Moonboots JS source';
    appOptions.jsConfig.notes = appOptions.jsConfig.notes || 'Returns the compiled JS from moonboots';
    appOptions.jsConfig.tags = appOptions.jsConfig.tags || ['moonboots', 'js'];
    appOptions.jsConfig.handler = appOptions.jsConfig.handler ||
        function jsRouteHandler(request, reply) {
            getJsSource(function _getJsSource(err, js) {
                reply(js).header('content-type', 'text/javascript; charset=utf-8');
            });
        };

    /* CSS config */
    var getCssSource = lockAsyncFunction(clientApp.cssSource.bind(clientApp));

    appOptions.cssConfig = appOptions.cssConfig || {};
    appOptions.cssConfig.description = appOptions.cssConfig.description || 'Moonboots CSS source';
    appOptions.cssConfig.notes = appOptions.cssConfig.notes || 'Returns the compiled CSS from moonboots';
    appOptions.cssConfig.tags = appOptions.cssConfig.tags || ['moonboots', 'css'];
    appOptions.cssConfig.handler = appOptions.cssConfig.handler ||
        function cssRouteHandler(request, reply) {
            getCssSource(function _getCssSource(err, css) {
                reply(css).header('content-type', 'text/css; charset=utf-8');
            });
        };
    if (!appOptions.developmentMode) {
        appOptions.jsConfig.cache = {
            expiresIn: appOptions.cachePeriod
        };
        appOptions.cssConfig.cache = {
            expiresIn: appOptions.cachePeriod
        };
    }
    clientApp.on('log', plugin.log.bind(plugin));
    clientApp.on('ready', function _clientAppReady() {
        if (appOptions.routes.js) {
            servers.route({
                method: 'get',
                path: '/' + encodeURIComponent(clientApp.jsFileName()),
                config: appOptions.jsConfig
            });
        }
        if (appOptions.routes.css) {
            servers.route({
                method: 'get',
                path: '/' + encodeURIComponent(clientApp.cssFileName()),
                config: appOptions.cssConfig
            });
        }
        if (appOptions.routes.html) {
            servers.route({
                method: 'get',
                path: appOptions.appPath,
                config: appOptions.appConfig
            });
        }
        if (appOptions.logLevel !== 'none') {
            plugin.log(['moonboots-hapi', appOptions.logLevel], {message: 'moonboots app ready', appPath: appOptions.appPath});
        }
        plugin.expose('clientConfig', function _getClientConfig(cb) {
            return cb(appOptions);
        });
        plugin.expose('clientApp', function _getClientApp(cb) {
            return cb(clientApp);
        });
        next();
    });
};

exports.register.attributes = {
    pkg: require('./package.json')
};
