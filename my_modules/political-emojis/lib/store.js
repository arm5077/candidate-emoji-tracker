var twitterEmojiStream = require("./my_modules/twitter-emoji-stream/index");
var mysql = require("mysql");
var fs = require("fs");
var express = require("express");
var app = express();



var io;
module.exports = {}

module.exports.app = app;



module.exports.acceptConnections = function(server, callback){
	io = require('socket.io')(server);
	io.on('connection', function (socket) {
			console.log("connected");
		});
}

	

module.exports.filterPoliticalEmojis = function(server){
	
	// Create pool of connections
	var pool = mysql.createPool((process.env.CLEARDB_DATABASE_URL || "mysql://root@localhost/candidate-emoji-tracker") + "?debug=true&charset=utf8mb4");
	pool.on("error", function(err){  
		console.log(err);
		pool.end;
	});

	// Get list of candidates
	var candidates = JSON.parse(fs.readFileSync("candidates.json"));

	app.get("/api/connect", function(request, response){
		console.log("boooo");
	});

	// Build regex string
	var candidate_re = new RegExp(candidates.map(function(d){ return d.last_name.toLowerCase() }).join('|'), 'g')
	var candidates_array = candidates.map(function(d){ return d.full_name.toLowerCase() });

	var stream = new twitterEmojiStream({ 
		consumer_key: process.env.CONSUMER_KEY, 
		consumer_secret: process.env.CONSUMER_SECRET, 
		access_token_key: process.env.ACCESS_TOKEN_KEY,
		access_token_secret: process.env.ACCESS_TOKEN_SECRET
	}, candidates_array, function(err, data){
		if(err) throw err;

		// Grab candidate names
		data.candidates = (data.tweet + " " + data.quoted_tweet + " " + data.quoted_tweeter).toLowerCase().match(candidate_re);

		var used_candidates = [];
		if(data.candidates){
			data.candidates.forEach(function(candidate){
				var used_emojis = [];
				if( used_candidates.indexOf(candidate) == -1 ){
					used_candidates.push(candidate);
					data.emojis.forEach(function(emoji){
						if( used_emojis.indexOf(emoji) == -1 ){
							used_emojis.push(emoji);
							data.link = "http://twitter.com/" + data.author + "/status/" + data.id;
							pool.query('INSERT INTO emoji_counts (candidate, emoji, text, link) values (?, ?, ?, ?)', [candidate, emoji, data.tweet, data.link], function(err){ if(err) throw err; });
							io.emit("tweet", { link: data.link, candidate: candidate, emoji: emoji });
						}					
					});
				}
			});
		}

		console.log(data.tweet);
		console.log(data.candidates);

	});
}