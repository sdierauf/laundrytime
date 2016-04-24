

laundryTimeApp.controller('overviewCtrl', function ($scope,$routeParams, modalFactory, $http) {
	$scope.queue_times = {}

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
		return all_machines
	}

	$scope.currentMachines = []

	var setCurrentMachines = function(data){
		$scope.currentMachines = []
		for(i = 0; i < data.length; i++){
			machine = data[i]
			if(machine['location'] == $scope.currentResName.toLowerCase()){
				$scope.currentMachines.push(machine)
				var sum = 0
				for(j = 0; j < machine.queue.length; j ++){
					sum += machine.queue[j].minutes
				}
				$scope.queue_times[machine.name] = sum
			}
			
		}
		$scope.$apply();
	}

	$scope.getQueueTime = function(machine) {
		var ret = 0;
		if (machine.activeJob && machine.activeJob.minutes) {
			ret = machine.activeJob.minutes;
		}
		if (!machine) { return }
		for (var i = 0; i < machine.queue.length; i++) {
			ret += machine.queue[i].minutes;
		}
		return ret;
	}

	$scope.fuck = function() {
		return 5;
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

	$scope.sendToModalFactory = function(machineName, activeJob){
		modalFactory.setMachineName(machineName)
		modalFactory.setMachineActiveMinutes(activeJob)

		//Unclever way to update queue view 
		//$scope.togglePersonsList(machineName)
		//$scope.togglePersonsList(machineName)
		$scope.getQueueCopy()
	}

	$scope.getQueueCopy = function(){
		return modalFactory.getQueue().then(
			function(obj){
				var queue = [];
				for(var i = 0; i < obj.data.queue.length; i++){
					queue.push(obj.data.queue[i]);
				} 
				modalFactory.setMachineQueue(queue);  
			}
				);
	}


	

	console.log("Overview configured");

});