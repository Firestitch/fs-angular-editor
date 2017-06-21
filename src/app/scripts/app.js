'use strict';

angular
.module('app', [
    'config',
    'ui.router',
    'ngMaterial',
    'fs-angular-editor'
])
.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {

    $locationProvider.html5Mode(true);
    $urlRouterProvider
    	.otherwise('/404')
    	.when('', '/demo')
    	.when('/', '/demo');

    $stateProvider
    .state('demo', {
        url: '/demo',
        templateUrl: 'views/demo.html',
        controller: 'DemoCtrl'
    })

    .state('404', {
        templateUrl: 'views/404.html',
        controller: 'DemoCtrl'
    });

})
.run(function ($rootScope, BOWER) {
    $rootScope.app_name = BOWER.name;
});
