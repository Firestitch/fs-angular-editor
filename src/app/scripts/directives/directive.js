(function () {
    'use strict';

	fsModel.$inject = ['$scope', '$attrs', '$parse'];
	function fsModel($scope, $attr, $parse) {
	  this.$viewValue = Number.NaN;
	  this.$modelValue = Number.NaN;
	  this.$$rawModelValue = undefined;
	  this.$parsers = [];
	  this.$formatters = [];
	  this.$untouched = true;
	  this.$touched = false;
	  this.$pristine = true;
	  this.$dirty = false;
	  this.$$parsedNgModel = $parse($attr.fsModel);
	  this.$$parsedNgModelAssign = this.$$parsedNgModel.assign;
	  this.$$ngModelGet = this.$$parsedNgModel;
	  this.$$ngModelSet = this.$$parsedNgModelAssign;
	  this.$$parserValid = undefined;
	  this.$$scope = $scope;
	  this.$$attr = $attr;
	  this.$$parse = $parse;

	  var ctrl = this;
	  ctrl.$$scope.$watch(function ngModelWatch() {
	  	var modelValue = ctrl.$$ngModelGet(ctrl.$$scope);

	    if (modelValue !== ctrl.$modelValue &&
	        (ctrl.$modelValue === ctrl.$modelValue || modelValue === modelValue)
	    ) {
	      ctrl.$modelValue = ctrl.$$rawModelValue = modelValue;
	      ctrl.$$parserValid = undefined;

	      var formatters = ctrl.$formatters,
	          idx = formatters.length;

	      var viewValue = modelValue;
	      while (idx--) {
	        viewValue = formatters[idx](viewValue);
	      }
	      if (ctrl.$viewValue !== viewValue) {
	        ctrl.$viewValue = ctrl.$$lastCommittedViewValue = viewValue;
	        ctrl.$render();
	      }
	    }

	    return modelValue;
	  });
	};

	fsModel.prototype = {
	  $$initGetterSetters: function() {
	      var invokeModelGetter = this.$$parse(this.$$attr.fsModel + '()'),
	          invokeModelSetter = this.$$parse(this.$$attr.fsModel + '($$$p)');

	      this.$$ngModelGet = function($scope) {
	        var modelValue = this.$$parsedNgModel($scope);
	        return modelValue;
	      };
	      this.$$ngModelSet = function($scope, newValue) {
	        this.$$parsedNgModelAssign($scope, newValue);
	      };
	  },

	  $render: function() {},

	  $isEmpty: function(value) {
	    return value===undefined || value === '' || value === null || value !== value;
	  },

	  $setPristine: function() {
	    this.$dirty = false;
	    this.$pristine = true;
	  },

	  $setDirty: function() {
	    this.$dirty = true;
	    this.$pristine = false;
	  },

	  $setUntouched: function() {
	    this.$touched = false;
	    this.$untouched = true;
	  },

	  $setTouched: function() {
	    this.$touched = true;
	    this.$untouched = false;
	  },

	  $rollbackViewValue: function() {
	    this.$viewValue = this.$$lastCommittedViewValue;
	    this.$render();
	  },

	  $commitViewValue: function() {
	    var viewValue = this.$viewValue;

	    // If the view value has not changed then we should just exit, except in the case where there is
	    // a native validator on the element. In this case the validation state may have changed even though
	    // the viewValue has stayed empty.
	    if (this.$$lastCommittedViewValue === viewValue && (viewValue !== '' || !this.$$hasNativeValidators)) {
	      return;
	    }
	    this.$$lastCommittedViewValue = viewValue;

	    // change to dirty
	    if (this.$pristine) {
	      this.$setDirty();
	    }
	    this.$$parseAndValidate();
	  },

	  $$parseAndValidate: function() {
	    var viewValue = this.$$lastCommittedViewValue;
	    var modelValue = viewValue;
	    var that = this;

	    this.$$parserValid = modelValue===undefined ? undefined : true;

	    if (this.$$parserValid) {
	      for (var i = 0; i < this.$parsers.length; i++) {
	        modelValue = this.$parsers[i](modelValue);
	        if (modelValue===undefined) {
	          this.$$parserValid = false;
	          break;
	        }
	      }
	    }

	    var prevModelValue = this.$modelValue;
	    this.$$rawModelValue = modelValue;

		this.$modelValue = modelValue;
		writeToModelIfNeeded();

	    function writeToModelIfNeeded() {
	      if (that.$modelValue !== prevModelValue) {
	        that.$$writeModelToScope();
	      }
	    }
	  },

	  $$writeModelToScope: function() {
	    this.$$ngModelSet(this.$$scope, this.$modelValue);
	  },

	  $setViewValue: function(value, trigger) {
	    this.$viewValue = value;
	    this.$commitViewValue();
	  }
	};

	angular.module('fs-angular-model',[])
	.directive('fsModel',function() {
		return {
			restrict: 'A',
			controller: fsModel,
			priority: 1,
			compile: function (element) {
			  return {
			    pre: function ngModelPreLink(scope, element, attr, ctrls) {
			    	ctrls.$$initGetterSetters();
			    },
			    post: function ngModelPostLink(scope, element, attr, ctrls) {

			    }
			  };
			}

        }
	});

    angular.module('fs-angular-editor',['fs-angular-model'])
    .directive('fsEditor', function(fsEditor) {
        return {
            template: '<textarea ng-model="model"></textarea>',
            restrict: 'E',
            transclude: true,
            require: '^fsModel',
            scope: {
	            options: '=?fsOptions',
	            data: '=?fsData'
            },
            link: function($scope, element, attrs, fsModel) {

            	var instance = {
            		element: angular.element(element[0].querySelector('textarea')),
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
			            		fsModel.$setViewValue(instance.editor.code.get());
			            		fsModel.$commitViewValue();

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

                fsModel.$render = function() {
                    instance.editor.code.set(fsModel.$viewValue || '',{ start: true });
                    updateFixedToolbar();
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
