(function(window, angular) {
    'use strict';

    angular.module('ngRouter', ['ng', 'ngRoutingService'])
        .provider('router', ['$routeProvider', RouterProvider])
    ;

    /**
     * Router provider.
     * @param {object} $routeProvider
     * @constructor
     */
    function RouterProvider($routeProvider)
    {
        var namedRoutes = [];

        // Proxy method for native router.
        this.when = function(path, route) {
            normalizeRoute(path, route);
            addRoute(route);
            // Maintaining chainability.
            return this;
        };

        this.$get = ['routingService', function(routingService) {
            routingService.setPlaceholderPattern('angular');
            for (var i in namedRoutes) {
                var namedRoute = namedRoutes[i];
                routingService.add(namedRoute.name, {
                    path: namedRoute.path
                });
            }
            return routingService;
        }];

        /**
         * Normalizes route.
         * @param {string} path
         * @param {object} route
         */
        function normalizeRoute(path, route)
        {
            route.path = path;
        }

        /**
         * Central place for adding routes.
         * @param {object} route
         */
        function addRoute(route)
        {
            // Saving named routes for later.
            if ('undefined' !== typeof route.name) {
                namedRoutes.push(route);
            }

            // Registering native route.
            registerNativeRoute(route);
        }

        /**
         * Actually registers route with native router.
         * @param {object} route
         */
        function registerNativeRoute(route)
        {
            $routeProvider.when(route.path, route);
        }
    }

})(window, angular);