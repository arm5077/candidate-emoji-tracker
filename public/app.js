angular.module("app", [])
.controller("controller", ["$scope", "$http", "$sce", function($scope, $http, $sce){
	
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
	
}]);