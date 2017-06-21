'use strict';


angular.module('app')
  .controller('DemoCtrl', function ($scope, $q) {


    var autocomplete =
    {
        data: function(query) {
        	return $q(function(resolve) {

        		resolve([{ template: 'Ray Tom', data: { id: 1, name: 'Ray Tom' } },
        					{ template: 'Bob Smith', data: { id: 2, name: 'Bob Smith' }},
        					{ template: 'Long John Silver Silver Silver Silver Silver', data: { id: 2, name: 'Long Silver' }} ]);
        	});
        },
        insert: function(item) {
            return angular.element('<inline-user>')
                            .attr('data-uid',item.id)
                            //.attr('contenteditable','false')
                            .append('@' + item.name);
        }
    };

	$scope.redactorOptions =
             {  buttons: ['format', 'bold', 'italic', 'deleted', 'lists'],
                plugins: ['save','alignment', 'bufferbuttons', 'table', 'source', 'fontcolor', 'iconic', 'autocomplete'],
                linkify: false,
                scrollTarget: '#element-drawer .pane-main .fs-drawer-wrap',
               	autocomplete: autocomplete,
                callbacks: {
                    change: function(value, event) {

                    }

                }};

    $scope.submit = function() {
        alert('submit');
    }
});
