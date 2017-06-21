'use strict';


angular.module('app')
  .controller('DemoCtrl', function ($scope, $q) {


    var autocomplete =
    {
        data: function(query) {
        	return $q(function(resolve) {

        		if(!query) {
        			return resolve([]);
        		}

        		resolve([{ template: 'Ray Tom', user: { id: 1, name: 'Ray Tom' } },
        					{ template: 'Bob Smith', user: { id: 2, name: 'Bob Smith' }},
        					{ template: 'Long John Silver Silver Silver Silver Silver', user: { id: 2, name: 'Long Silver' }} ]);
        	});
        },
        insert: function(item) {
            return angular.element('<inline-user>')
                            .attr('data-uid',item.user.id)
                            //.attr('contenteditable','false')
                            .append('@' + item.user.name);
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
                        $scope.comment.disabled = false;
                        $scope.element.dirty = true;
                    },
                    keydown: function(e) {
                        if(e.keyCode==13 && e.ctrlKey) {
                            e.preventDefault();
                            $scope.elementAuditAdd();
                        }
                    }
                }};

    $scope.submit = function() {
        alert('submit');
    }
});
