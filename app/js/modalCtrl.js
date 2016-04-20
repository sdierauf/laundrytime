laundryTimeApp.controller('modalCtrl', function($scope, modalFactory) {

	$scope.modalFactory = modalFactory;

	/* I think this variable doesn't need to be shared 
	between controllers */
	$scope.userToBeDeleted = {
		email: "", 
		pin: ""
	}; 
	$scope.loading = false; 

	/* handle functions */
	var handleSuccess = function(data){
		console.log("Success: ");
		console.log(data); 	
		$scope.loading = false; 
	}

	var handleError = function(res){
		window.alert("Error " + res.status + ": " + res.data.message); 
		$scope.loading = false; 
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
		$scope.loading = true;
		modalFactory.addUserToQueue().
		then(function(res){
			/* Ok */
			$scope.loading = false;
			$scope.getQueue();
			$('#LoginModal').modal('hide');
			$('#LineModal').modal('show'); 
		},handleError);
	}

	$scope.reportProblem = function(){
		if(validateDescriptionandUpdate()){
			$scope.loading = true;
			modalFactory.reportProblem().then(function(res){
				$('#reportModal').modal('hide'); 	
				/* would be fine to add a "success dialog" */
			}, handleError);

		}else{
			/* Error */
			window.alert("Try with another description please"); 
		}
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
		}
		/* Erorr */
			,handleError);
	}

	/* Validation process for the Login modal */
	$scope.validateLogin = function(){ 
		if(validatePINandUpdate('LoginPinForm', modalFactory.userInfo.pin) 
			& validateEmailandUpdate('LoginEmailForm',modalFactory.userInfo.email))
		{
			/* Everything OK */
			$scope.addUserToQueue(); 
		}
	}

	/* This method will add 'has-error' to elementId class 
	if the PIN is not accepted, true = ok  */
	var validatePINandUpdate = function(elementId, pin){
		if(!checkPIN(pin)){
			document.getElementById(elementId).className = 'form-group has-error';
			return false; 
		}else{
			document.getElementById(elementId).className = 'form-group'
			return true;
		}
	}

	/* return true if ok, otherwise false */
	var checkPIN = function(pin){
		return !(pin === undefined
		|| pin.length < 4
		|| isNaN(pin));
	}


	/* This method will add 'has-error' to elementId class 
	if the email is not accepted, true = ok  */
	var validateEmailandUpdate = function(elementId, email){
    	if(!checkEmail(email)){
			document.getElementById(elementId).className = 'form-group has-error';
    		return false; 
    	}else{
			document.getElementById(elementId).className = 'form-group'
    		return true; 
    	}
	}

	/* return true if ok, otherwise false */
	var checkEmail = function(email){
		var re = /\S+@\S+\.\S+/;
		return re.test(email);
	}

	/* true = ok */
	var validateDescriptionandUpdate = function(){
		if(modalFactory.reportSelector.selected === '5'
			&& modalFactory.reportSelector.description.length === 0){
			/* Error */
			document.getElementById('reportFormDescription').className = "form-group has-error";
			return false; 
		}else{
			/*everything ok */
			document.getElementById('reportFormDescription').className = "form-group";
			return true; 
		}
	}

	/* Calls the factory to remove a user from the queue */
	$scope.deleteUser = function(){
		/* validate pin */
		if(validatePINandUpdate('deletePinForm', $scope.userToBeDeleted.pin)){
			$scope.loading = true; 
			modalFactory.deleteUser($scope.userToBeDeleted.email, 
				$scope.userToBeDeleted.pin).then(
				function(res){
					/* everything ok */
					$('#DeleteModal').modal('hide'); 
					$scope.userToBeDeleted.pin = "";
					$scope.loading = false;  
					window.alert("User deleted successfully.");
				},handleError); 
		}
	}

	/* Transition LineModal -> DeleteModal */
	$scope.showDeleteUser = function(user){
		$scope.userToBeDeleted.email = user; 
		$('#LineModal').modal('hide'); 
		$('#deleteUserEmail').text(user);
		$('#DeleteModal').modal('show'); 
	}

});/* endController */
