angular.module("app", ['ngAnimate'])
.controller("controller", ["$scope", "$http", "$sce", function($scope, $http, $sce){
	
	$scope.feed = [];
	$http.get("/api/latest").success(function(data){
		$scope.feed = data;
	});
	
	
	$http.get("candidates.json").success(function(data){
		
		$scope.candidates = {};
		data.forEach(function(d){
			$scope.candidates[d.last_name.toLowerCase()] = d.full_name;
		});
		console.log($scope.candidates);
	});
	
	$http.get("/api/list").success(function(data){
		$scope.data = data;
	});
	
	
	var socket = io();
	socket.on('tweet', function (data) {
		$scope.$apply(function(){
			$scope.feed.unshift(data);
		})
		console.log(data);
	});
	
}]);