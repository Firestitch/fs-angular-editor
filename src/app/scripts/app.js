'use strict';

angular
.module('app', [
    'config',
    'ui.router',
    'ngMaterial',
    'fs-angular-editor'
])
.config(function ($stateProvider, $urlRouterProvider, $locationProvider, fsEditorProvider) {

	fsEditorProvider.options({ imageUpload: '/images' });
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
.run(function ($rootScope, BOWER, fsEditor) {
    $rootScope.app_name = BOWER.name;

    fsEditor.on('uploadBeforeSend',function(formData,e) {
    	formData.append('api-key','93284yshiu643578ghsfd9745632y');
    });
});
