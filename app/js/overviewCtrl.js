

laundryTimeApp.controller('overviewCtrl', function ($scope,$routeParams, modalFactory) {


	$scope.getResidenceName = function() {
		return $routeParams.res
	}

	function capitalizeFirstLetter(string) {
    	return string.charAt(0).toUpperCase() + string.slice(1);
	}
	$scope.currentResName = capitalizeFirstLetter($scope.getResidenceName())


	$scope.getAllMachines = function() {
		var xmlHttp = new XMLHttpRequest()
		xmlHttp.open( "GET", "/machines", true ) //Async set to false

		xmlHttp.send()
		var all_machines = xmlHttp.responseText
		//console.log(all_machines)


		return all_machines
	}

	$scope.currentMachines = []

	var setCurrentMachines = function(data){
		$scope.currentMachines = []
		for(i = 0; i < data.length; i++){
			machine = data[i]
			if(machine['location'] == $scope.currentResName.toLowerCase()){
				$scope.currentMachines.push(machine)
			}
		}
		console.log($scope.currentMachines)
	}

	$scope.getAllMachinesFromResidence = function() {
		var xmlHttp = new XMLHttpRequest()
		xmlHttp.open( "GET", "/machines", true ) //Async set to false

		xmlHttp.send()
		var all_machines = xmlHttp.responseText

		$.get("/machines", setCurrentMachines, "json")
		console.log("Sent request for all machines")
	}
	$scope.getAllMachinesFromResidence()
	

	$scope.getQueueSizeFromMachine = function(name){
		var xmlHttp = new XMLHttpRequest()
		xmlHttp.open( "GET", "/machines/" + name + "/queue")
		xmlHttp.send()

		return xml.responseText.length
	}


	/* Method to pass data to modalFactory */
	$scope.sendToModalFactory = function(machineName){
		modalFactory.setMachineName(machineName); 
	}

	console.log("Overview configured")

});