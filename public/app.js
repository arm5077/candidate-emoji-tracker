angular.module("app", ['ngAnimate'])
.controller("controller", ["$scope", "$http", "$sce", function($scope, $http, $sce){
	
	// Hard-coding party in here
	$scope.party = {
		"clinton": "democrat",
		"sanders": "democrat",
		"o'malley": "democrat",
		"webb": "democrat"
	}
	$scope.feed = [];
	$http.get("/api/latest").success(function(data){
		data = data.filter(function(d){ 
			return !RegExp(/\uD83C[\uDFFB-\uDFFF]|\uD83D\uDE02/).test(d.emoji);
		 });
		$scope.feed = data;
	});
	
	
	$http.get("candidates.json").success(function(data){
		
		$scope.candidates = {};
		data.forEach(function(d,i){
			$scope.candidates[d.last_name.toLowerCase()] = d.full_name;
		});
	});
	
	$http.get("/api/list").success(function(data){
		
		// Get rid of í ½í¸‚... it's so popular that it skews the results
		// Also get rid of skin tones
		data.forEach(function(candidate){
			candidate.emojis.forEach(function(d){
				if(RegExp(/\uD83C[\uDFFB-\uDFFF]|\uD83D\uDE02/).test(d.emoji))
					candidate.total -= d.count;
			})
			candidate.emojis = candidate.emojis.filter(function(d){ 
				return !RegExp(/\uD83C[\uDFFB-\uDFFF]|\uD83D\uDE02/).test(d.emoji);
			 });
			
			// Figure out percentages
			candidate.emojis.forEach(function(emoji){
				emoji.percentage = Math.round(emoji.count / candidate.total * 1000) / 10; 
			});
		});
		
		
		
		// Bind to DOM
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