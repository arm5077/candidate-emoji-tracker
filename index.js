var express = require("express");
var app = express();
var server = require('http').Server(app);
var api = require("./node_modules/api");
var politicalEmojis = require("./node_modules/political-emojis");


// Start web server 
var port = process.env.PORT || 3000;

server.listen(port, function(){
	console.log("we're ready to roll!")
});

app.use('/api', api)
	.use('/stream', politicalEmojis.app);

// Set up static page (main page)
app.use("/", express.static(__dirname + "/public/"));


politicalEmojis.acceptConnections(server);
politicalEmojis.filterPoliticalEmojis();
