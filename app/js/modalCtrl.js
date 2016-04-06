laundryTimeApp.controller('resiCtrl', function($scope) {
	/* Report Modal */
	$scope.reportSelector = {
		selected: 1, 
		description: "", 
		show: false 
		}; 

	$scope.reportModSelChanged = function () {
		this.reportSelector.show = (this.reportSelector.selected == 5); 
	}
	/* end Report Modal */
	
});/* endController */

/*
Last updated Ger: 
This controller handles the modals triggered by the buttons 
*/
