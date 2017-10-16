(function () {
    'use strict';

    angular.module('fs-angular-editor',['fs-angular-model','fs-angular-util','fs-angular-theme'])
    .filter('fsEditorTrustHtml', ['$sce','fsUtil', function($sce,fsUtil) {
        return function(text) {
        	return $sce.trustAsHtml(fsUtil.string(text));
        };
    }]);
})();
