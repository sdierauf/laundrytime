

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
		xmlHttp.open( "GET", "localhost:8080/machines/", true ) //Async set to false

		xmlHttp.send()
		var all_machines = xmlHttp.responseText
		//console.log(all_machines)


		return all_machines
	}

	$scope.getAllMachinesFromResidence = function() {
		var xmlHttp = new XMLHttpRequest()
		xmlHttp.open( "GET", "localhost:8080/machines/", true ) //Async set to false

		xmlHttp.send()
		var all_machines = xmlHttp.responseText

		var ret_machines = []
		for(machine in all_machines){
			if(machine["name"] == $scope.currentResName){
				ret_machines.append(machine)
			}
		}
		return ret_machines
	}

	$scope.currentMachines = $scope.getAllMachinesFromResidence()

	$scope.getQueueSizeFromMachine = function(name){
		var xmlHttp = new XMLHttpRequest()
		xmlHttp.open( "GET", "/machines/" + name + "/queue")
		xmlHttp.send()

		return xml.responseText.length
	}

	console.log("Overview configured")

});
console.log("Was overviewCtrl configured")