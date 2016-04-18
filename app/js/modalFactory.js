laundryTimeApp.factory('modalFactory', function($cookieStore, $http) {

	var cookReportSelector = $cookieStore.get('reportSelector'); 
	var cookUserInfo = $cookieStore.get('userInfo'); 

	/* */
	this.machine = {
		name: "", 
		queue: []
	}

	/* if there is not value stored in cookies */
	if(cookReportSelector === undefined){
		 this.reportSelector = {
			selected: 1, 
			description: "", 
			show: false 
		};  
	}else{
		this.reportSelector = cookReportSelector; 
	}

	if(cookUserInfo === undefined){
			 this.userInfo = {
				email: "", 
				pin: null
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
	this.addUserToQueue = function(){
		var req = $http({
			method: 'POST', 
			url: '/machines/'+this.machine.name+'/queue',
			data: {
				user: this.userInfo.email,
				minutes: 20, 
				pin: this.userInfo.pin, 
			}
		});

		return req; 
	}

	/* Setters and Getters */

	this.setMachineQueue = function(queue){
		this.machine.queue = queue; 
	}

	this.setMachineName = function(newName){
		this.machine.name = newName; 
	}

	this.getQueue = function(){
		return $http.get('/machines/'+this.machine.name+'/queue');
	}
	
	/* return the service */
	return this;	
});