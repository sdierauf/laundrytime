laundryTimeApp.controller('modalCtrl', function($scope, modalFactory) {

	$scope.modalFactory = modalFactory;

	/* handle functions */
	var handleSuccess = function(data){
		console.log("Success: ");
		console.log(data); 
	}

	var handleError = function(data){
		console.log("Error in modalCtrl.handleError():"); 
		console.log(data); 
	}
	
	/* functions */
	$scope.reportModSelChanged = function () {
		modalFactory.reportSelector.show = 
		(modalFactory.reportSelector.selected == 5); 
	}

	$scope.saveUserCookies = function(){
		modalFactory.saveUserCookies(); 
	}

	/* html calls */

	/* POST REQUEST */
	$scope.addUserToQueue = function(){
		modalFactory.addUserToQueue().
		then(handleSuccess, handleError); 
		/* update Queue */
		$scope.getQueue(); 
	}

	/* GET REQUEST */
	$scope.getQueue = function(){
		modalFactory.getQueue().then(
		/* Success */
		function(obj){
			var queue = [];
			for(var i = 0; i < obj.data.queue.length; i++){
				queue.push(obj.data.queue[i]);
			} 
			modalFactory.setMachineQueue(queue);  
			console.log(obj);
			console.log("Modal has got the queue machine successfully."); 
		}
		/* Erorr */
			, function(obj){
				console.log("Error in 'modalCtrl.getQueue()': "); 
				console.log(obj); 
			});
	}

});/* endController */
