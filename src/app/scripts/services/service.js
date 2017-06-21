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
