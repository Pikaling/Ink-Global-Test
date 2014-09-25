describe("The cities controller", function() {
	var $httpBackend, $rootScope, createController;

	beforeEach(module('weatherStation'));

	beforeEach(inject(function ($injector) {
		$httpBackend = $injector.get('$httpBackend');
		$rootScope = $injector.get('$rootScope');
		var $controller = $injector.get('$controller');
		createController = function() {
			return $controller('CitiesCtrl', {
				'$scope': $rootScope
			});
		};
	}));

	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	it("should load an array of city IDs from a JSON file, and use this to fetch the weather data", function() {
		$httpBackend.expect('GET', 'js/cities.json').respond('{"cityIds":[1,2,3,4]}');
		$httpBackend.expect('GET', 'http://api.openweathermap.org/data/2.5/group?id=1,2,3,4&units=metric')
		.respond('{"list": [{"name": "London"},	{"name": "Luton"}]}');
		var controller = createController();
		$httpBackend.flush(1);
		expect($rootScope.state).toEqual('Fetching weather for 1,2,3,4');
		$httpBackend.flush(1);
		expect($rootScope.state).toEqual('Successfully loaded weather data');
		expect($rootScope.cities.length).toEqual(2);
	});

	it("should call the error function when an error response is returned", function() {
		$httpBackend.expect('GET', 'js/cities.json').respond('{"cityIds":[1,2,3,4]}');
		$httpBackend.expect('GET', 'http://api.openweathermap.org/data/2.5/group?id=1,2,3,4&units=metric')
		.respond(function(method, url, data, headers) {
			return[500, 'response body', {}, 'Internal Server Error'];
		});
		var controller = createController();
		$httpBackend.flush();
		expect($rootScope.state).toEqual('Error fetching cities: 500, Internal Server Error');
	});

	describe("sort cities function", function() {
		it("should sort the cities by temperature", function() {
			$httpBackend.expect('GET', 'js/cities.json').respond('{"cityIds":[1,2,3,4]}');
			$httpBackend.expect('GET', 'http://api.openweathermap.org/data/2.5/group?id=1,2,3,4&units=metric')
			.respond('{"list": [{"name": "London", "main": {"temp": "18"}}, {"name": "Luton", "main": {"temp" : "16"}}]}');
			var controller = createController();
			$httpBackend.flush();
			$rootScope.sortCities('main.temp');
			expect($rootScope.sort.column).toEqual('main.temp');
			expect($rootScope.sort.descending).toBe(false);
			$rootScope.sortCities('main.temp');
			expect($rootScope.sort.column).toEqual('main.temp');
			expect($rootScope.sort.descending).toBe(true);
		});
	});
});