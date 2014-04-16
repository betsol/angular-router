(function(window, angular) {
    'use strict';

    angular.module('ngRouter', ['ng', 'ngRoutingService'])
        .provider('router', ['$routeProvider', RouterProvider])
    ;

    /**
     * Router provider.
     * @param $routeProvider
     * @constructor
     */
    function RouterProvider($routeProvider)
    {
        var namedRoutes = [];
        var transformers = [];
        var pendingRoutes = [];
        var delayRouteRegistration = false;
        var predefinedTransformers = {};

        /**
         * Whether to delay routes registration.
         * @param value
         */
        this.delayRouteRegistration = function(value) {
            delayRouteRegistration = (value ? true : false);
            // Maintaining chainability.
            return this;
        };

        /**
         * Updated pending named route with additional properties.
         * @param {string} routeName
         * @param {object} updatedRoute
         * @returns {RouterProvider}
         */
        this.updateRoute = function(routeName, updatedRoute) {
            if (pendingRoutes.length > 0) {
                for (var i in pendingRoutes) {
                    var initialRoute = pendingRoutes[i];
                    if ('undefined' !== typeof initialRoute.name && initialRoute.name == routeName) {
                        angular.extend(initialRoute, updatedRoute);
                    }
                }
            }
            // Maintaining chainability.
            return this;
        };

        /**
         * Clearing pending routes.
         * @returns {RouterProvider}
         */
        this.clearPendingRoutes = function() {
            clearPendingRoutes();

            // Maintaining chainability.
            return this;
        };

        /**
         * Manually register pending routes.
         */
        this.registerRoutes = function() {
            if (pendingRoutes.length > 0) {
                for (var i in pendingRoutes) {
                    var route = pendingRoutes[i];
                    registerRoute(route);
                }
                clearPendingRoutes();
            }

            // Maintaining chainability.
            return this;
        };

        /**
         * Adds transformer.
         * @param transformer
         * @returns {RouterProvider}
         */
        this.addTransformer = function(transformer, parameters) {
            if ('function' !== typeof transformer) {
                if ('function' == typeof predefinedTransformers[transformer]) {
                    transformer = predefinedTransformers[transformer];
                } else {
                    throw new Error('Parameter "transformer" must be a callback function or a name of pre-defined transformer.');
                }
            }

            transformers.push({
                callable: transformer,
                parameters: parameters
            });

            // Maintaining chainability.
            return this;
        };

        /**
         * Clears transformers.
         * @returns {RouterProvider}
         */
        this.clearTransformers = function() {
            transformers = [];
            // Maintaining chainability.
            return this;
        };

        /**
         * Adds specified routes.
         * @param routes
         */
        this.addRoutes = function(routes) {
            for (var key in routes) {
                var route = routes[key];
                var path = ('undefined' !== typeof route.path ? route.path : key);
                this.when(path, route);
            }
            // Maintaining chainability.
            return this;
        };

        // Proxy method for native router.
        this.when = function(path, route) {
            route.path = path;
            addRoute(route);
            // Maintaining chainability.
            return this;
        };

        this.$get = ['routingService', function(routingService) {
            for (var i in namedRoutes) {
                var route = namedRoutes[i];
                routingService.addRoute(route.name, {
                    path: route.path
                });
            }
            return routingService;
        }];

        /**
         * Runs transformers on specified route.
         * @param {object} route Initial route.
         * @returns {object} Transformed route.
         */
        function runTransformersOnRoute(route) {
            for (var i in transformers) {
                var transformer = transformers[i];

                var callable = transformer.callable;

                var parameters = [];
                if ('undefined' != typeof transformer.parameters) {
                    angular.extend(parameters, transformer.parameters);
                }

                parameters.unshift(route);

                route = callable.apply(callable, parameters);
            }
            return route;
        }

        /**
         * Central place for adding routes.
         * @param route
         */
        function addRoute(route)
        {
            // Running transformers on route before anything else.
            if (transformers.length > 0) {
                route = runTransformersOnRoute(route);
            }

            // Saving named routes for later.
            if ('undefined' !== typeof route.name) {
                namedRoutes.push(route);
            }

            // Registering route.
            if (!delayRouteRegistration) {
                registerRoute(route);
            } else {
                pendingRoutes.push(route);
            }
        }

        /**
         * Actually registers route with native router.
         * @param route
         */
        function registerRoute(route)
        {
            var _route = angular.extend({}, route);

            $routeProvider.when(route.path, route);
        }

        function clearPendingRoutes() {
            pendingRoutes = [];
        }

        /**
         * Transformer to replace Symfony2 router placeholders with Angular ones.
         * @param {object} route
         * @returns {object}
         */
        predefinedTransformers['SymfonyPlaceholders'] = function(route) {
            route.path = route.path.replace(/{\s*(.+)\s*}/g, ':$1');
            return route;
        };

        predefinedTransformers['ControllersFromNames'] = function(route, nameDelimiter, namingStrategy, suffix) {

            // Handling only named routes.
            if ('undefined' == typeof route.name) {
                return route;
            }

            // Name delimiter.
            if ('undefined' == typeof nameDelimiter) {
                nameDelimiter = '.';
            }

            // Naming strategy.
            if ('undefined' == typeof namingStrategy) {
                namingStrategy = 'PascalCase';
            }

            // Suffix.
            if ('undefined' == typeof suffix) {
                suffix = 'Ctrl';
            }

            var controllerName = '';
            var parts = (route.name).split(nameDelimiter);
            for (var i in parts) {
                var part = parts[i];

                switch (namingStrategy) {
                    case 'camelCase':
                        if (i > 0) {
                            controllerName += part.substr(0, 1).toUpperCase() + part.substr(1);
                        } else {
                            controllerName += part;
                        }
                        break;
                    case 'PascalCase':
                        controllerName += part.substr(0, 1).toUpperCase() + part.substr(1);
                        break;
                    default:
                        throw new Error('Unknown naming strategy: "' + namingStrategy + '"');
                }
            }

            route.controller = controllerName + suffix;

            return route;
        };
    }

})(window, angular);