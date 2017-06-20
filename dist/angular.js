
(function () {
    'use strict';

<<<<<<< HEAD
    angular.module('fs-angular',[])
    .directive('fsAngular', function($location) {
=======
    angular.module('fs-angular-tabnav',[])
    .directive('fsTabnav', function() {
>>>>>>> fcb4bd29a2327f85f5b7a3a6811ea9edf000595e
        return {
            templateUrl: 'views/directives/template.html',
            restrict: 'E',
            scope: {
               
            },
<<<<<<< HEAD
            link: function($scope, element, attrs) {

=======
            controller: function($scope) {
            
            },
            link: function($scope, element, attrs) {
               
>>>>>>> fcb4bd29a2327f85f5b7a3a6811ea9edf000595e
            }
        };
    });
})();


