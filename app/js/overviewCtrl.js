

laundryTimeApp.controller('overviewCtrl', function ($scope,$routeParams, modalFactory, $http) {


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
		console.log('what the hell');
		$scope.currentMachines = [];
		for(i = 0; i < data.length; i++){
			machine = data[i]
			if(machine['location'] == $scope.currentResName.toLowerCase()){
				$scope.currentMachines.push(machine)
				console.log(machine)
			}
			
		}
		$scope.$apply();
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

 	$scope.fixProblem = function(machineName) {
 		console.log('fixing priblem of ' + machineName);
 		var machine;
 		for (var i = 0; i < $scope.currentMachines.length; i++) {
 			if ($scope.currentMachines[i].name == machineName) {
 				machine = $scope.currentMachines[i];
 			}
 		}
 		machine.problemMessage = null;
 		var xmlHttp = new XMLHttpRequest()
 		xmlHttp.open( "GET", "/machines/" + machineName + '/report/fixed', true );
 		xmlHttp.send();
 		console.log('allegedly fixing problme');
 	}


	$scope.getQueueSizeFromMachine = function(name){
		var xmlHttp = new XMLHttpRequest()
		xmlHttp.open( "GET", "/machines/" + name + "/queue")
		xmlHttp.send()

		return xml.responseText.length
	}

	$scope.people = []
	getDaQueue = function(machineName){
		return $http.get('/machines/'+machineName+'/queue');
	}

	$scope.getQueue = function(machineName){
		return getDaQueue(machineName).then(
			function(obj){
				var queue = [];
				for(var i = 0; i < obj.data.queue.length; i++){
					queue.push(obj.data.queue[i]);
				} 
				$scope.people = queue
			}
				);
	}

	$scope.getQueueFromMachine = function(name){
		var xmlHttp = new XMLHttpRequest()
		xmlHttp.open( "GET", "/machines/" + name + "/queue")
		xmlHttp.send()
		return xmlHttp.responseText
	}

	$scope.togglePersonsList = function(machineName){
		if(document.getElementById("queueView" + machineName).innerHTML == ""){
			$scope.getQueue(machineName).then(function(){
				str = "<table>"
				for(i = 0; i < $scope.people.length; i ++){
					elem = $scope.people[i]
					str += "<tr>"
					str += "<td>" + elem.user + "</td>"
					str += "<td>" + elem.minutes + "</td>"
					str += "</tr>"
				}
				str += "</table>"
				console.log(str)
				document.getElementById("queueView" + machineName).innerHTML = str
			})
			document.getElementById("arrow" + machineName).innerHTML == " ^ "
		}
		else{
			document.getElementById("queueView" + machineName).innerHTML = ""
			document.getElementById("arrow" + machineName).innerHTML == " X "
		}
	}


	

	console.log("Overview configured");

});