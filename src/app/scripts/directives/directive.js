(function () {
    'use strict';
    angular.module('fs-angular-editor')
    .directive('fsEditor', function(fsEditor, fsTheme) {
        return {
            template: ' <div class="fs-editor" ng-click="init()" ng-style="themeStyles">\
            				<div class="fs-editor-content redactor-styles" ng-if="options.clickToEdit && !inited">\
            					<div class="fs-editor-edit" ng-style="themeStyles"></div><div class="fs-editor-edit-icon"><md-icon>edit</md-icon></div>\
            					<div ng-bind-html="model|fsEditorTrustHtml"></div>\
            				</div>\
            				<textarea ng-model="model" class="fs-angular-model" style="display:none">\
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
            		editor: null
            	};

            	$scope.options = $scope.options || {};
            	$scope.options.instance = instance;
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
            		toolbarOverflow: true
            	};

            	function init() {

            		if($scope.inited) {
            			return;
            		}

            		$scope.inited = true;

	                try {
	                    instance.element.redactor('core.destroy');
	                } catch(e) {}

	                var options = angular.merge({},defaults,fsEditor.options(),$scope.options,{
	                	callbacks: {
		                    change: angular.bind(this,callback,'change'),
		                    paste: angular.bind(this,callback,'paste')
		                },
		                clickToEdit: false
		            });

	                instance.element.redactor(options);
	                instance.editor = instance.element.redactor('core.object');

	                instance.editor.upload.send = angular.bind(instance.editor,function(send, formData, e) {
	                	fsEditor.trigger('uploadBeforeSend',[formData, e]);
	                	send(formData,e);
	                },instance.editor.upload.send);
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

	            $scope.$on('$destroy',function() {
	            	element.off('remove');
	            	if(instance.editor) {
	            		instance.editor.core.destroy();
	            	}

		        	if($scope.options.scrollTarget) {
		            	$($scope.options.scrollTarget).off('scroll');
		        	}
	            });
            }
        };
    });
})();
