This AngularJS module is a drop-in extension for default `ngRoute` module.

With this module you will be able to automatically generate URLs for named routes,
thus removing repetitions from your code and making it clear and more robust.

# Why do I need this?

Native `ngRoute` module allows you to define parametrized routes. But it uses this
definitions only to match and parse requests. If you want to build URLs for your routes
you have to do this manually.

The good practice is to use centralized approach, i.e. routing system to both match and
generate URLs. With such system you will be able to define routes only once and reuse this
definitions whenever appropriate.

Please consider this example:

``` javascript
$routeProvider
    .when('/user/:userId/post/:postId/comment/add', {
        templateUrl: '/partials/user-post-comment-add.html',
        controller: 'UserPostCommentAddCtrl'
    })
;
```

In order to dynamically specify this route inside of a view you will have to do something like this:

``` html
<a href="/user/{{ user.id }}/post/{{ post.id }}/comment/add">Add comment</a>
```

In other words, you will have to repeat URL definition every time you need to output it somewhere.
And when time comes to refactor your code and change structure of URLs, you will need to use
regular expression search to find all places where this URL is specified. What a mess!

You think there must be a better way? Read on!

# Usage

## Installation

1). Just install `angular-router` where you see fit. And include it to your page with you favorite method.

Also install [`js-router`][js-router] library as `angular-router` is using it internally.

**Example:**

``` html
<script type="text/javascript" src="betsol/js-router/js-router.js"></script>
<script type="text/javascript" src="betsol/angular-router/angular-router.js"></script>
```

2). Add dependency for `ngRouter` in your application's module. Make sure that `ngRoute` is also available.

**Example:**

``` javascript
angular.module('application', [
    'ngRoute',
    'ngRouter',
    // ...
]);
```

3). Just replace all calls to `$routeProvider` with `routerProvider`.

**Example:**

``` javascript
angularModule
    .config([
        function($locationProvider, routerProvider) {
            $locationProvider.html5Mode(true);
            routerProvider // Here, "$routeProvider" replaced with "routerProvider"
                .when('/user/:userId/post/:postId/comment/add', {
                    templateUrl: '/partials/user-post-comment-add.html',
                    controller: 'UserPostCommentAddCtrl'
                })
                .when('foo', { /** ... */ })
                .when('bar', { /** ... */ })
                .when('baz', { /** ... */ })
            ;
        }
    ])
;
```

## Defining named routes

Named routes are just a normal routes but with a unique name specified. This name is used
whenever you need to reference a specific route, e.g. during URL generation.

Therefore we will be calling regular native routes an anonymous routes.

To convert anonymous route to named route you just need to specify name for it.
In order to do so you will need to pass `name` parameter as part of route definition.

**Example:**

``` javascript
routerProvider
    .when('/user/:userId/post/:postId/comment/add', {
        name: 'user-post-comment-add',
        templateUrl: '/partials/user-post-comment-add.html',
        controller: 'UserPostCommentAddCtrl'
    })
;
```

In this example named route will have a following name: `user-post-comment-add`.

## Generating URLs

In order to generate URLs for named routes you will need to fetch the `routing` service first.

In controller you can do it this way:

``` javascript
.controller('AppCtrl', ['$scope', 'router', function($scope, router) {
        // "router" is an instance of routing service.
    }
])
```

You can even register routing service at root scope in order to use it inside of any views.

**Example:**

``` javascript
.controller('AppCtrl', ['$rootScope', 'router', function($rootScope, router) {
        $rootScope.router = router;
    }
])
```

Now, you are able to use routing service both in your JavaScript world and in the views.

## Using router inside of controller

``` javascript
.controller('AppCtrl', ['$scope', 'router', function($scope, router) {
        $scope.url = router.generate('user-post-comment-add', {
            userId: 100,
            postId: 500
        });
        // $scope.url = '/user/100/post/500/comment/add'
    }
])
```

## Using router in your views

``` html
<a href="{{ router.generate('user-post-comment-add', { userId: 100, postId: 500 }) }}">Add comment</a>
<!-- <a href="/user/100/post/500/comment/add">Add comment</a> -->
```

That's all! Easy right? ;)

# API description

## `routerProvider` provider

Provider is conforming to native `ngRoute` interface. But adding an optional `name` parameter to route definitions.

## `router` service

Router service is actually a [`js-router`][js-router] instance with pre-configured named routes.

Please consult [`js-router`'s][js-router-doc] documentation for it's API description.

# License

The MIT License (MIT)

Copyright (c) 2014 Slava Fomin II

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

[js-router]: https://github.com/betsol/js-router
[js-router-doc]: https://github.com/betsol/js-router/blob/master/readme.md