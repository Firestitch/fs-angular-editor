(function () {
    'use strict';

    angular.module('fs-angular-editor',[])
    .directive('fsEditor', function(fsEditor) {
        return {
            template: '<textarea ng-model="model"></textarea>',
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
            		content: $scope.model
            	},
            	fixedToolbarInterval;

            	if($scope.instance) {
            		angular.extend($scope.instance,instance);
            	}

            	$scope.options = $scope.options || {};

                var options = angular.extend({},fsEditor.options(),$scope.options,{
                	callbacks: {
	                    change: function() {
			            	$scope.$apply(function() {
			            		$scope.model = instance.editor.code.get();
			            		instance.content = $scope.model;

					            if($scope.options.callbacks.change) {
				                    $scope.options.callbacks.change($scope.model,
				                    	{   options: $scope.options,
				                            element: element,
				                            meta: $scope.meta });
					        	}
			            	});
			            },
	                    imageUpload: function(img,response) {
	                        angular.element(img).attr('src',response.data.url);
	                        img.replaceWith(angular.element('<p>').append(img.clone()));
	                    }
	                },
	                toolbarOverflow: true
	            });

                try {
                    instance.element.redactor('core.destroy');
                } catch(e) {}

                instance.element.redactor(options);
                instance.editor = instance.element.redactor('core.object');
                instance.editor.code.set($scope.model,{ start: true });

                instance.editor.upload.send = angular.bind(instance.editor,function(send, formData, e) {
                	fsEditor.trigger('uploadBeforeSend',[formData, e]);
                	send(formData,e);
                },instance.editor.upload.send);

                $scope.$watch('model',function(value,ovalue) {
                	if(value!=instance.content) {
                		instance.editor.code.set(value);
                	}
                });

	            $scope.$on('$destroy',function() {
	            	element.off('remove');
	            	instance.editor.core.destroy();

		        	if($scope.options.scrollTarget) {
		            	$($scope.options.scrollTarget).off('scroll');
		        	}

		        	clearInterval(fixedToolbarInterval);
	            });

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
            }
        };
    });
})();
