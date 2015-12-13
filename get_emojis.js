var twitterEmojiStream = require("twitter-emoji-stream");
var mysql = require("mysql");
var fs = require("fs");

// Create pool of connections
var pool = mysql.createPool((process.env.CLEARDB_DATABASE_URL || "mysql://root@localhost/candidate-emoji-tracker") + "?debug=true&charset=utf8mb4");
pool.on("error", function(err){  
	console.log(err);
	pool.end;
});

// Get list of candidates
var candidates = JSON.parse(fs.readFileSync("candidates.json"));

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
						pool.query('INSERT INTO emoji_counts (candidate, emoji, text) values (?, ?, ?)', [candidate, emoji, data.tweet], function(err){ if(err) throw err; });
					}					
				});
			}
		});
	}

	console.log(data.tweet);
	console.log(data.candidates);

});

