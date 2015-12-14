var express = require("express");
var app = express();
var mysql = require("mysql");

// Create pool of connections
var pool = mysql.createPool((process.env.CLEARDB_DATABASE_URL || "mysql://root@localhost/candidate-emoji-tracker") + "?debug=true&charset=utf8mb4");
pool.on("error", function(err){  
	console.log(err);
	pool.end;
});

// Start web server 
var port = process.env.PORT || 3000;
app.listen(port, function(){
	console.log("We're live at port " + port + ".");
});

// Set up static page (main page)
app.use("/", express.static(__dirname + "/public/"));

// Endpoint to get full emoji list per candidate
app.get("/api/list", function(request, response){	
	pool.query('SELECT candidate, emoji, COUNT(emoji) as count FROM emoji_counts GROUP BY candidate, emoji ORDER BY candidate ASC, count DESC', function(err, rows){ 
		if(err) throw err; 
		
		var candidates = [];
		
		rows.forEach(function(row){
			var index = candidates.map(function(d){ return d.name }).indexOf(row.candidate);
			if( index == -1 ){
				candidates.push({ name: row.candidate, emojis: [] });
				index = candidates.length - 1;
			}
			candidates[index].emojis.push({ emoji: row.emoji, count: row.count })
			
		});
		response.status(200).json(candidates);
	});
});