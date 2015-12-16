angular.module("app", ['ngAnimate'])
.controller("controller", ["$scope", "$http", "$sce", function($scope, $http, $sce){
	
	$scope.renderHTML = function(text){ return $sce.trustAsHtml(text); };	
	$scope.twemoji = twemoji;
	
	$scope.renderEmoji = function(emoji, size){
		switch(size){
			case "small": size = "16x16"; break;
			case "medium": size = "36x36"; break;
			case "large": size = "72x72"; break;
		}
		
		// rolling eyes emoji?
		if(new RegExp(/\uD83D\uDE44/).test(emoji))
			return $scope.renderHTML('<img class="emoji" draggable="false" alt="rolling eyes" src="'+'/extra_emoji/' + size + '/1f644.png'+'">');
		else if(RegExp(/\uD83E\uDD14/).test(emoji))
			return $scope.renderHTML('<img class="emoji" draggable="false" alt="rolling eyes" src="'+'/extra_emoji/' + size + '/1f914.png'+'">');
		else {
			var code = $scope.twemoji.parse(emoji, function(icon, options, variant){
				return '/bower_components/twemoji/' + size + '/' + icon + '.png';
			})
		}
		
		
		return $scope.renderHTML(code);
	}
	
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
			$scope.feed.splice(10 , 20);
		})
		console.log(data);
	});
	
}]);