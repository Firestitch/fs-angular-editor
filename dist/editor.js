
(function () {
    'use strict';
    angular.module('fs-angular-editor',['fs-angular-model'])
    .directive('fsEditor', function(fsEditor) {
        return {
            template: '<textarea ng-model="model" class="fs-angular-model">',
            restrict: 'E',
            transclude: true,
            require: '^fsModel',
            scope: {
	            options: '=?fsOptions',
	            data: '=?fsData'
            },
            link: function($scope, element, attrs, fsModel) {

            	var instance = {
            		element: angular.element(element[0].querySelector('.fs-angular-model')),
            		editor: null
            	};

            	$scope.options = $scope.options || {};
            	$scope.options.instance = instance;
            	$scope.options.data = $scope.data;

            	var defaults = {
            		formatting: [],
			        formattingAdd: {
			            'normal': {
			                title: 'Normal',
			                args: ['p']
			            },
			            'h1': {
			                title: 'Heading 1',
			                args: ['h1']
			            },
			            'h2': {
			                title: 'Heading 2',
			                args: ['h2']
			            },
			            'h3': {
			                title: 'Heading 3',
			                args: ['h3']
			            },
			            'code': {
			                title: 'Code Block',
			                args: ['pre']
			            }
			        },
            		toolbarOverflow: true
            	};

                var options = angular.merge({},defaults,fsEditor.options(),$scope.options,{
                	callbacks: {
	                    change: function() {
			            	$scope.$apply(function() {
			            		fsModel.value(instance.editor.code.get());
			            		fsModel.commit();

					            if($scope.options.callbacks.change) {
				                    $scope.options.callbacks.change(instance.editor.code.get(),
				                    	{   options: $scope.options,
				                            element: instance.element });
					        	}
			            	});
			            }
	                }
	            });

                try {
                    instance.element.redactor('core.destroy');
                } catch(e) {}

                instance.element.redactor(options);
                instance.editor = instance.element.redactor('core.object');

                instance.editor.upload.send = angular.bind(instance.editor,function(send, formData, e) {
                	fsEditor.trigger('uploadBeforeSend',[formData, e]);
                	send(formData,e);
                },instance.editor.upload.send);

                fsModel.watch = function() {
                	/*
                	HACK: TO compinstate for the redactor 10m timeout that is messing around with this.start boolean
					if (this.opts.type === 'textarea')
					{
						setTimeout($.proxy(function()
						{
							this.code.startSync(html);

						}, this), 10);
					}
					*/

                    setTimeout(function() {
                    	instance.editor.code.set(fsModel.value() || '',{ start: true });
                    	updateFixedToolbar();
                    },15);
                }

	            $scope.$on('$destroy',function() {
	            	element.off('remove');
	            	instance.editor.core.destroy();

		        	if($scope.options.scrollTarget) {
		            	$($scope.options.scrollTarget).off('scroll');
		        	}
	            });

	            function updateFixedToolbar() {
              	  if(instance.editor.opts.toolbarFixedTarget !== document) {
	            		var $el = $(instance.editor.opts.toolbarFixedTarget);
	            		if($el.length) {
	                		instance.editor.toolbar.setFixed();
	                	}
	                }
	            }
            }
        };
    });
})();

(function() {

    'use strict';

    angular.module('fs-angular-editor')

    .provider('fsEditor', function() {
        var self = { 	options: null,
        				events: [] };

        this.options = function(options) {

            if (!arguments.length)
                return self.options;

            self.options = angular.merge({}, self.options, options);
        }

        this.$get = function() {

            return {
            	options: options,
            	on: on,
            	trigger: trigger
            };

            function options() {
            	return self.options;
            }

            function on(type,func) {
            	self.events.push({ type: type, func: func });
            }

            function trigger(type,data) {
            	angular.forEach(self.events,function(event) {
            		if(event.type==type) {
            			event.func.apply(this,data);
            		}
            	});
            }
        };
    });
})();

