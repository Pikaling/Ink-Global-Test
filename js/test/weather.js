describe("The waether controller", function() {
	var $httpBackend, $rootScope, routeParams, createController;

	beforeEach(module('weatherStation'));

	beforeEach(inject(function ($injector) {
		$httpBackend = $injector.get('$httpBackend');
		$rootScope = $injector.get('$rootScope');
		routeParams = {cityId: 1};
		var $controller = $injector.get('$controller');
		createController = function() {
			return $controller('WeatherCtrl', {
				'$scope': $rootScope,
				'$routeParams': routeParams
			});
		};
	}));

	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	it("should fetch the weather data for the selected city", function() {
		$httpBackend.expect('GET', 'http://api.openweathermap.org/data/2.5/weather?id=1&units=metric')
		.respond('{"id": 1, "name": "London", "coord": {"lon": 1, "lat": 1}, "weather": [{"description": "rain", "icon": "10d"}], "main": {"temp": 18, "temp_min": 15, "temp_max": 20, "pressure": 1000, "humidity": 50}}');
		var controller = createController();
		$httpBackend.flush();
		expect($rootScope.state).toEqual("Successfully loaded weather for 1");
		expect($rootScope.currentCity.name).toEqual("London");
		expect($rootScope.imageUrl).toEqual("http://openweathermap.org/img/w/10d.png");
	});

	it("should call the error function if it cannot load the data", function() {
		$httpBackend.expect('GET', 'http://api.openweathermap.org/data/2.5/weather?id=1&units=metric')
		.respond(function(method, url, data, headers) {
			return[500, 'response body', {}, 'Internal Server Error'];
		});
		var controller = createController();
		$httpBackend.flush();
		expect($rootScope.state).toEqual('Error fetching weather: 500, Internal Server Error');
	});

});