laundryTimeApp.factory('modalFactory', function($cookieStore, $http) {

	var cookReportSelector = $cookieStore.get('reportSelector'); 
	var cookUserInfo = $cookieStore.get('userInfo'); 

	/* */
	this.machine = {
		name: "", 
		queue: []
	}

	this.errorText = ""; 

	/* if there is not value stored in cookies */
	if(cookReportSelector === undefined){
		 this.reportSelector = {
			selected: '1', 
			description: "", 
			show: false 
		};  
	}else{
		this.reportSelector = cookReportSelector; 
	}

	if(cookUserInfo === undefined){
			 this.userInfo = {
				email: "", 
				pin: ""
			};  
	}else{
		this.userInfo = cookUserInfo; 
	}

	/* cookies */
	this.saveUserCookies = function(){
		$cookieStore.put('userInfo', this.userInfo);
	}
	/* end Cookies */

	/* http requests */
	/* add the current user to the ueue of the current machine */
	this.addUserToQueue = function(){
		/* aprox time */
		var users_in_queue = this.machine.queue.length; 
		console.log("AQUI:" + users_in_queue);
		console.log(this.machine.queue); 
		if(users_in_queue === undefined){
			users_in_queue = 0; 
		}
		var aprox_time = users_in_queue * 50; 
		if(aprox_time > 90){
			aprox_time = 90; /* 24 hours */
		}

		/* request */
		var req = $http({
			method: 'POST', 
			url: '/machines/'+this.machine.name+'/queue',
			data: {
				user: this.userInfo.email,
				minutes: aprox_time, 
				pin: this.userInfo.pin, 
			}
		});

		return req; 
	}

	/* Get the queue of the current machine */
	this.getQueue = function(){
		return $http.get('/machines/'+this.machine.name+'/queue');
	}

	/* send a report to the serverjs */
	this.reportProblem = function(){
		var payload = {
			message: ""
		}; 
		switch(this.reportSelector.selected){
			case '1':
				payload.message = "The machine doesn't work";
				break;
			case '2': 
				payload.message = "Someone has stolen the whaser";
				break;
			case '3': 
				payload.message = "There is a monster staring at me";
				break;
			case '4': 
				payload.message = "I'm just bored";
				break;
			case '5': 
				payload.message = this.reportSelector.description;
				break; 
		}
		return $http.post('/machines/'+this.machine.name+'/report', payload); 
	}

	this.deleteUser = function(email, pin){
		var payload = {
			user: email, 
			pin: pin
		};
		return $http.post('/machines/'+this.machine.name+'/queue/delete', payload); 		
	}

	/* Setters and Getters */

	this.setMachineQueue = function(queue){
		this.machine.queue = queue; 
	}

	this.setMachineName = function(newName){
		this.machine.name = newName; 
	}

	this.setErrorText = function(newError){
		this.errorText = newError; 
	}
	
	/* return the service */
	return this;	
});