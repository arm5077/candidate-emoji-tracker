var express = require("express");
var app = express();
var server = require('http').Server(app);
var mysql = require("mysql");
var api = require("api");
var politicalEmojis = require("political-emojis");

// Start web server 
var port = process.env.PORT || 3000;

server.listen(port, function(){
	console.log("we're ready to roll!")
});

// Create pool of connections
global.pool = mysql.createPool((process.env.CLEARDB_DATABASE_URL || "mysql://root@localhost/candidate-emoji-tracker") + "?debug=false&charset=utf8mb4&connectionLimit=9");
pool.on("error", function(err){  
	console.log(err);
	pool.end;
});


app.use('/api', api)
	.use('/stream', politicalEmojis.app);

// Set up static page (main page)
app.use("/", express.static(__dirname + "/public/"));


politicalEmojis.acceptConnections(server);
politicalEmojis.filterPoliticalEmojis();

setInterval(function(){ console.log("new list built!"); politicalEmojis.buildList(server) }, 60000)
