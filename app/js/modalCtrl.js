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

	$scope.reportProblem = function(){
		if(validateDescription()){
			modalFactory.reportProblem().then(handleSuccess, handleError);
			$('#reportModal').modal('hide'); 
		}else{
			/* Error */
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
			console.log(obj);
			console.log("Modal has got the queue machine successfully."); 
		}
		/* Erorr */
			, function(obj){
				console.log("Error in 'modalCtrl.getQueue()': "); 
				console.log(obj); 
			});
	}

	/* Validation process for the Login modal */
	$scope.validateLogin = function(){ 
		if(validatePIN('LoginPinForm') & validateEmail('LoginEmailForm'))
		{
			/* Everything OK */
			$scope.addUserToQueue(); 
			$('#LoginModal').modal('hide');
			$('#LineModal').modal('show');  
		}else{
			/* Something Wrong */

		}
	}

	/* This method will add 'has-error' to elementId class 
	if the PIN is not accepted */
	var validatePIN = function(elementId){
		if(modalFactory.userInfo.pin === undefined
		|| modalFactory.userInfo.pin.length < 4
		|| isNaN(modalFactory.userInfo.pin)){
			document.getElementById(elementId).className = 'form-group has-error';
			return false; 
		}else{
			document.getElementById(elementId).className = 'form-group'
			return true;
		}
	}

	/* This method will add 'has-error' to elementId class 
	if the email is not accepted */
	var validateEmail = function(elementId){
		var re = /\S+@\S+\.\S+/;
    	if(!re.test(modalFactory.userInfo.email)){
			document.getElementById(elementId).className = 'form-group has-error';
    		return false; 
    	}else{
			document.getElementById(elementId).className = 'form-group'
    		return true; 
    	}
	}

	var validateDescription = function(){
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

});/* endController */
