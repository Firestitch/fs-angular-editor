'use strict';


angular.module('app')
  .controller('DemoCtrl', function ($scope, $q, fsDrawer) {

  	$scope.content = '<p>But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful.</p>' +
					'<p>Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?</p>' +
					'<p>On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided.</p>' +
					'<p>But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures pains to avoid worse pains. But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain</p>';


    var autocomplete =
    {
        data: function(query) {
        	return $q(function(resolve) {

        		resolve([{ template: 'Ray Tom', data: { id: 1, name: 'Ray Tom' } },
        					{ template: 'Bob Smith', data: { id: 2, name: 'Bob Smith' }},
        					{ template: 'Long John Silver Silver Silver Silver Silver', data: { id: 2, name: 'Long Silver' }} ]);
        	});
        },
        button: {
        	tooltip: 'Insert autocomplete',
        	icon: 'share'
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
                toolbarFixed: true,
            	toolbarFixedTarget: '.scroll',
               	autocomplete: autocomplete,
               	clickToEdit: true,
                callbacks: {
                    change: function(value, event) {

                    },
                    clicktoedit: function() {
                    	//alert("clicktoedit");
                    },
                   /* sanitize: function(element) {
                    	debugger;
                    }*/

                }};

	$scope.destroy = function() {
        $scope.redactorOptions.instance.destroy();
    }

    $scope.submit = function() {
        alert('submit');
    }

    $scope.openDrawer = function() {


   		fsDrawer.create({
   			templateUrl: 'views/drawer.html',
			controller: function($scope) {
				$scope.redactorOptions = {
					buttons: ['format', 'bold', 'italic', 'deleted', 'lists'],
	                plugins: ['save','alignment', 'bufferbuttons', 'table', 'source', 'fontcolor', 'iconic', 'autocomplete'],
	                linkify: false,
	                //toolbarFixed: true,
	            	//toolbarFixedTarget: '.scroll',
	                callbacks: {
	                    change: function(value, event) {

	                    }
	                }
	            };
            },
			//scope: scope,
			openOnCreate: true
		});
    }
});
