'use strict';

angular.module('AngularFlask', ['angularFlaskServices', 'ui.materialize'])
	.config(['$routeProvider', '$locationProvider', '$httpProvider',
		function($routeProvider, $locationProvider, $httpProvider) {

		$routeProvider
		.when('/', {
			templateUrl: 'partials/landing.html',
			controller: IndexController
		})
    .when('/hospitals', {
			templateUrl: 'partials/hospitals.html',
			controller: HospitalsController
		})
		.when('/gghos', {
			templateUrl: 'partials/gghos.html',
			controller: gghosController
		})
		.when('/road', {
			templateUrl: 'partials/road.html',
			controller: roadController
		})
		.when('/commodities', {
			templateUrl: 'partials/allcomo.html',
			controller: allcomoController
		})
		.otherwise({
			redirectTo: '/'
		})
		;

		$locationProvider.html5Mode(true);
		$httpProvider.defaults.headers.common = {};
	  $httpProvider.defaults.headers.post = {};
	  $httpProvider.defaults.headers.put = {};
	  $httpProvider.defaults.headers.patch = {};
		$httpProvider.defaults.headers.get = {};
	}])
;
