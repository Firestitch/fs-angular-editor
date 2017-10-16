'use strict';

angular
.module('app', [
    'config',
    'ui.router',
    'ngMaterial',
    'fs-angular-editor',
    'fs-angular-drawer',
    'fs-angular-theme'
])
.config(function ($stateProvider, $urlRouterProvider, $locationProvider, fsEditorProvider, fsThemeProvider) {

	fsThemeProvider.options({ primary: '4678AE', accent: '4678AE' });

	fsEditorProvider.options(
	{
		imageUpload: '/images',
		callbacks: {
			imageUpload: function(img,response) {
		    	angular.element(img).attr('src',response.data.url);
		        img.replaceWith(angular.element('<p>').append(img.clone()));
		    }
		}
	});

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
