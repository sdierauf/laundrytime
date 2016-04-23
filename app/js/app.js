var laundryTimeApp = angular.module('laundryTime', ['ngRoute','ngResource', 'ngCookies']);

laundryTimeApp.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.when('/home', {
			templateUrl: 'templates/welcome.html',
			controller: 'welcomeCtrl'
		}).
		when('/info', {
			templateUrl: 'templates/info.html'
		}).
		
		when('/explanation', {
			templateUrl: 'templates/explanationMachines.html'
		}).
		when('/about', {
			templateUrl: 'templates/about.html'
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