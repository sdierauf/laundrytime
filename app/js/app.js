 
var laundryTimeApp = angular.module('laundryTime', ['ngRoute','ngResource']);

laundryTimeApp.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.when('/home', {
			templateUrl: 'templates/welcome.html'
		}).
		when('/info', {
			templateUrl: 'templates/info.html'
		}).
		when('/residence/:res', {
			templateUrl: 'templates/residenceOverview.html',
			controller: 'overviewCtrl'
		}).
		otherwise({
			redirectto: '/home'
		})

	}
]);

console.log("Laundry time configured")