var Twitter = require('twitter');

var ranges = [
  '\ud83c[\udf00-\udfff]', // U+1F300 to U+1F3FF
  '\ud83d[\udc00-\ude4f]', // U+1F400 to U+1F64F
  '\ud83d[\ude80-\udeff]'  // U+1F680 to U+1F6FF
];
var emoji_re = new RegExp(ranges.join('|'), 'g');

function twitterEmojiStream(credentials, track, callback){
	if(!credentials || !track || !callback)
		callback("Required parameter not supplied")
			
	try {
		var client = new Twitter({
			consumer_key: credentials.consumer_key,
			consumer_secret: credentials.consumer_secret,
			access_token_key: credentials.access_token_key,
			access_token_secret: credentials.access_token_secret
		});
	}
	catch(err){
		callback(err);
	}
	
	if( Array.isArray(track) )
		track = track.join();	
	

	
	client.stream('statuses/filter', {track: track}, function(stream, err) {
		if(err) callback(err);
		stream.on('data', function(tweet) {
			if(emoji_re.test(tweet.text)){
				// See if the user is referring to another tweet
				if(tweet.quoted_status){
					quoted_tweet = tweet.quoted_status.text; 
					quoted_tweeter = tweet.quoted_status.screen_name;
				} else {
					quoted_tweet="";
					quoted_tweeter="";
				}
				callback(null, {id: tweet.id_str, author: tweet.user.screen_name, tweet: tweet.text, quoted_tweet: quoted_tweet, quoted_tweeter: quoted_tweeter, emojis: tweet.text.match(emoji_re)});
			}			
		});
	});
	
}


module.exports = twitterEmojiStream;