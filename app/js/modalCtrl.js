laundryTimeApp.controller('modalCtrl', function($scope, modalFactory) {
	/* Report modal */
	$scope.reportSelector = modalFactory.reportSelector;

	/* User info */
	$scope.userInfo = modalFactory.userInfo; 

	$scope.reportModSelChanged = function () {
		$scope.reportSelector.show = ($scope.reportSelector.selected == 5); 
	}

	$scope.checkPIN = function () {
		/* send PIN to db here */
	}

	$scope.saveUserCookies = function(){
		modalFactory.saveUserCookies(); 
	}
});/* endController */
