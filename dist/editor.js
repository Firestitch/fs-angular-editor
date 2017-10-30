(function () {
    'use strict';

    angular.module('fs-angular-editor',['fs-angular-model','fs-angular-util','fs-angular-theme'])
    .filter('fsEditorTrustHtml', ['$sce','fsUtil', function($sce,fsUtil) {
        return function(text) {
        	return $sce.trustAsHtml(fsUtil.string(text));
        };
    }]);
})();

(function () {
    'use strict';
    angular.module('fs-angular-editor')
    .directive('fsEditorContent', function(fsUtil,$sce) {
    	return {
    		template: '<div ng-bind-html="content"></div>',
	    	restrict: 'E',
	    	scope: {
	    		model: '=fsModel',
	    		sanitize: '&?fsSanitize'
	    	},
			link: function($scope, element, attrs) {
				$scope.content = '';
				$scope.$watch('model',function(model) {
					$scope.content = $sce.trustAsHtml(fsUtil.string(model));
					setTimeout(function() {
						$scope.sanitize({ element: element });
					});
				});
			}
		}
    })
    .directive('fsEditor', function(fsEditor, fsTheme) {
        return {
            template: ' <div class="fs-editor">\
            				<div class="fs-editor-content redactor-styles" ng-if="options.clickToEdit && !inited" ng-style="themeStyles">\
            					<div class="fs-editor-edit"><a class="fs-editor-edit-icon" ng-click="init()"><md-icon>edit</md-icon></a></div>\
            					<fs-editor-content fs-model="model" fs-sanitize="options.callbacks.sanitize(element)"></fs-editor-content>\
            				</div>\
            				<textarea ng-model="model" class="fs-angular-model">\
            			</div>',
            restrict: 'E',
            transclude: true,
            require: '^fsModel',
            scope: {
	            options: '=?fsOptions',
	            data: '=?fsData',
	            model: '=fsModel'
            },
            link: function($scope, element, attrs, fsModel) {

            	var instance = {
            		element: angular.element(element[0].querySelector('.fs-angular-model')),
            		editor: null,
            		destroy: destroy,
            		init: init
            	};

            	$scope.options = $scope.options || {};
            	$scope.options.instance = instance;
            	$scope.options.callbacks = $scope.options.callbacks || {};
            	$scope.options.data = $scope.data;
            	$scope.init = init;
            	$scope.themeStyles = { 'border-color': fsTheme.primaryHex() };

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
            		toolbarOverflow: true,
            		callbacks: {}
            	};

            	function init() {

            		if($scope.inited) {
            			return;
            		}

	                var options = angular.merge({},defaults,fsEditor.options(),$scope.options,{
	                	callbacks: {
		                    change: angular.bind(this,callback,'change'),
		                    paste: angular.bind(this,callback,'paste')
		                },
		                clickToEdit: false
		            });

            		destroy();
            		$scope.inited = true;

            		if($scope.options.clickToEdit && $scope.options.callbacks.clicktoedit) {
            			angular.bind(this,$scope.options.callbacks.clicktoedit)();
            		}

	                instance.element.redactor(options);
	                instance.editor = instance.element.redactor('core.object');

	                instance.editor.upload.send = angular.bind(instance.editor,function(send, formData, e) {
	                	fsEditor.trigger('uploadBeforeSend',[formData, e]);
	                	send(formData,e);
	                },instance.editor.upload.send);
	            }

	            function destroy() {

	                element.off('remove');
	            	if(instance.editor) {
	            		instance.editor.core.destroy();
	            	}

		        	if($scope.options.scrollTarget) {
		            	$($scope.options.scrollTarget).off('scroll');
		        	}

		        	$scope.inited = false;
		        	instance.editor = null;
	            }

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
					if(instance.editor) {
	                    setTimeout(function() {
	                    	instance.editor.code.set(fsModel.value() || '',{ start: true });
	                    	updateFixedToolbar();
	                    },15);
	                }
                }

	            function updateFixedToolbar() {
              	  if(instance.editor.opts.toolbarFixedTarget !== document) {
	            		var $el = $(instance.editor.opts.toolbarFixedTarget);
	            		if($el.length) {
	                		instance.editor.toolbar.setFixed();
	                	}
	                }
	            }

            	function callback(type,html) {
	            	$scope.$apply(function() {
	            		fsModel.value(html);
	            		fsModel.commit();

			            var cb = $scope.options.callbacks[type];
			            if(cb) {
		                    cb(instance.editor.code.get(),
		                    	{   options: $scope.options,
		                            element: instance.element
		                        });
			        	}
	            	});
            	}

            	if(!$scope.options.clickToEdit) {
	            	init();
	            }

	            $scope.$on('$destroy',destroy);
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

