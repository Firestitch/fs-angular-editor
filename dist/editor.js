
(function () {
    'use strict';

    angular.module('fs-angular-editor',[])
    .directive('fsEditor', function($timeout) {
        return {
            template: '<textarea fs-redactor fs-options="redactorOptions" fs-instance="redactorInstance"></textarea>',
            restrict: 'E',
            transclude: true,
            scope: {
               model: "=fsModel",
	            options: '=?fsOptions',
	            instance: '=?fsInstance',
	            meta: '=?fsMeta'
            },
            link: function($scope, element, attrs) {

            	var instance = {
            		element: angular.element(element[0].querySelector('textarea')),
            		editor: null,
            		content: ''
            	},
            	fixedToolbarInterval;

            	$scope.options = $scope.options || {};

                var options = angular.extend({},$scope.options,{
                	callbacks: {
	                    //keydown: $scope.options.callbacks.keydown,
	                    change: change,
	                    imageUpload: function(img,response) {
	                        angular.element(img).attr('src',response.data.url);
	                        img.replaceWith(angular.element('<p>').append(img.clone()));
	                        change();
	                    }
	                },
	                toolbarOverflow: true,
	                //imageUpload: CONFIG.api.url + 'image',
	                //imageUploadForms: '#redactor-form',
	                //plugins: $scope.options.plugins
	            });


                try {
                    instance.element.redactor('core.destroy');
                } catch(e) {}

                instance.element.redactor(options);
                instance.editor = instance.element.redactor('core.object');

                $scope.$watch('model',function(value,ovalue) {
                	if(value!=instance.content) {
                		instance.editor.code.set(value);
                	}
                });

	            $scope.$on('$destroy',function() {
	            	element.off('remove');
	                element.redactor('core.destroy');

		        	if($scope.options.scrollTarget) {
		            	$($scope.options.scrollTarget).off('scroll');
		        	}

		        	clearInterval(fixedToolbarInterval);
	            });

	            function change() {
	            	$scope.$apply(function() {
	            		$scope.model = instance.editor.code.get();
	            		instance.content = $scope.model;
	            	});

	            	//$timeout(function() {


	/*
			            if($scope.options.callbacks.change) {
		                    var event = {   options: $scope.options,
		                                    element: element,
		                                    meta: $scope.meta };
		                    $scope.options.callbacks.change(value, event);
			        	}*/


		        		//ngModel.$setViewValue(value);
		        	//},100);
	            }



                if(instance.editor.opts.toolbarFixedTarget !== document) {

            		var $el = $(instance.editor.opts.toolbarFixedTarget);
            		if($el.length) {

                		var fixedToolbar = angular.bind(instance.editor,function() {
                			instance.editor.toolbar.toolbarOffsetTop = instance.editor.core.box().offset().top - $el.offset().top + $el.scrollTop();
                		});

                		fixedToolbar();
                		instance.editor.toolbar.setFixed();
                		fixedToolbarInterval = setInterval(fixedToolbar,1000);
                	}
                }


                //Let redactor register the toolbar offset code and then overlay our hack
                //setTimeout(function() {
                	//$scope.options.instance.init();
	            //},700);

            }
        };
    });
})();

angular.module('fs-angular-editor').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/directives/editor.html',
    "fs-angular template"
  );

}]);
