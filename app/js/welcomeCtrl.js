
//Unused for now
laundryTimeApp.controller('welcomeCtrl', function ($scope, $routeParams) {
	$scope.getAllResidences = function(){
		var xmlHttp = new XMLHttpRequest()
		xmlHttp.open( "GET", "http://0.0.0.0:8080/machines", true ) //Async set to false

		xmlHttp.send()
		var response = xmlHttp.responseText

		console.log(all_machines)
		return all_machines
	}

	$scope.residences = $scope.getAllResidences()

});

console.log("Welcome Controller set")