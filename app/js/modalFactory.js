laundryTimeApp.factory('modalFactory', function($cookieStore, $http) {

	var cookReportSelector = $cookieStore.get('reportSelector'); 
	var cookUserInfo = $cookieStore.get('userInfo'); 

	/* */
	this.machineQueue = [];

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
				PIN: null
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
	this.addUserToQueue = function(machineName){
		var req = $http({
			method: 'POST', 
			url: '/machines/'+machineName+'/queue',
			data: {
				user: this.userInfo.email,
				minutes: 20, 
				pin: 0000, 
			}
		});

		return req; 
	}

	this.getQueue = function(machineName){
		return $http.get('/machines/'+machineName+'/queue');
	}
	
	/* return the service */
	return this;	
});