

laundryTimeApp.controller('overviewCtrl', function ($scope,$routeParams) {


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
	}
	$scope.getAllMachinesFromResidence()
	

	$scope.getQueueSizeFromMachine = function(name){
		var xmlHttp = new XMLHttpRequest()
		xmlHttp.open( "GET", "/machines/" + name + "/queue")
		xmlHttp.send()

		return xml.responseText.length
	}

	console.log("Overview configured")

});
console.log("Was overviewCtrl configured")