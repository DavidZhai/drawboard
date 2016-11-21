var app = angular.module('drawboardApp', []);

app.controller('drawboardCtrl', [function($scope) {

	$scope.text = "";

	$scope.submit = function() {
		console.log($scope.text);
	};
}]);
