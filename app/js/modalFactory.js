laundryTimeApp.factory('modalFactory', function($cookieStore) {

	/* Load cookies */
	var cookReportSelector = $cookieStore.get('reportSelector'); 
	var cookUserInfo = $cookieStore.get('userInfo'); 

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

	/* end Cookies */

	this.saveUserCookies = function(){
		$cookieStore.put('userInfo', this.userInfo);
	}

	/* return the service */
	return this;	
});