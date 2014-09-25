(function() {

	"use strict";

	var app = angular.module('weatherStation', ['ngRoute']);

	app.controller('CitiesCtrl', ['$scope', '$http', function($scope, $http) {

		$scope.state = '';
		$scope.cities = [];
		$scope.sort = {
			column: '',
			descending: false
		};

		$http.get('js/cities.json')
		.then(function success(response) {
			$scope.updateState('Fetched city IDs');
			return response.data.cityIds.join();
		},
		function error(response) {
			$scope.updateState('Error fetching city IDs: ' + response.status + ', ' + response.statusText);
		})
		.then(function success(cityIds) {
			$scope.updateState('Fetching weather for ' + cityIds);
			return $http.get('http://api.openweathermap.org/data/2.5/group?id=' + cityIds + '&units=metric');
		},
		function error(response) {
			$scope.updateState('Error: ' + response);
		})
		.then(function success(response) {
			$scope.updateState('Successfully loaded weather data');
			$scope.cities = response.data.list;
		},
		function error(response) {
			$scope.updateState('Error fetching cities: ' + response.status + ', ' + response.statusText);
		});

		$scope.updateState = function(state) {
			$scope.state = state;
			console.log($scope.state);
		};

		$scope.sortCities = function(column) {
			if($scope.sort.column === column) {
				$scope.sort.descending = !$scope.sort.descending;
			} else {
				$scope.sort.column = column;
				$scope.sort.descending = false;
			}
		};
	}]);

	app.controller('WeatherCtrl', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {
		$scope.currentCity = {};

		if($routeParams.hasOwnProperty("cityId")) {
			$http.get('http://api.openweathermap.org/data/2.5/weather?id=' + $routeParams.cityId + '&units=metric')
			.then(function success(response) {
			$scope.updateState('Successfully loaded weather for ' + $routeParams.cityId);
			$scope.currentCity = response.data;
			$scope.imageUrl = "http://openweathermap.org/img/w/" + $scope.currentCity.weather[0].icon + ".png";
			},
			function error(response) {
				$scope.updateState('Error fetching weather: ' + response.status + ', ' + response.statusText);
			});
		}

		$scope.updateState = function(state) {
			$scope.state = state;
			console.log($scope.state);
		};
	}]);

	app.config(function($routeProvider, $locationProvider) {
		$routeProvider
		.when('/index.html', {
			templateUrl: 'partials/main.html',
			controller: 'CitiesCtrl'
		})
		.when('/city/:cityId', {
			templateUrl: 'partials/city.html',
			controller: 'WeatherCtrl'
		})
		.otherwise({
			redirectTo:'/index.html'
		});
		$locationProvider.html5Mode(true);
	});
})();