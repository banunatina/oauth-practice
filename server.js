var express = require('express');
var app = express();
var request = require('request');
var url = require('url');
var qs = require('querystring');

var user = {};
user.username;
user.repos;
user.webhooks;

// serve static assets
app.use(express.static(__dirname));

// redirect to login - for dev
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html'); 
});

// redirect to github for authorization
app.get('/login', function(req, res) {
  console.log('redirect to auth');
  res.redirect('https://github.com/login/oauth/authorize?client_id='
               + CLIENT_ID 
               + '&redirect_uri='
               + REDIRECT_URI
               + '&scope='
               + SCOPES
              );
});

app.get('/auth/callback', function(req, res) {
  // Parses for querystring
  var query = url.parse(req.url, true).query;
  // Exchanges code for access token
  if (query.code) {
    // Sets options for request
    var options = {
     url: 'https://github.com/login/oauth/access_token',
     qs: {
       client_id : CLIENT_ID,
       client_secret : CLIENT_SECRET,
       code : query.code,
       redirect_uri : 'http://127.0.0.1:8000/auth/callback'
     },
     headers: {
       'Accept' : 'application/json'
     }
   }; 

   // POST Request for Access Token
   request.post(options, function (err, response, body) {
     // Parses body and sets access token
     ACCESS_TOKEN = JSON.parse(body).access_token;
     res.redirect('/success');
   });
  } 
});

app.get('/success', function(req, res) {
      var options = {
        url: GITHUB_API + 'user',
        headers : {
          'User-Agent' : USER_AGENT,
          'Authorization' : 'token ' + ACCESS_TOKEN
        }
      };

      request.get(options, function(error, response, body) {
        if (error) {
          console.error(error);
        } else {
          var parsed = JSON.parse(body);
          session.username = parsed.login;  
          session.repos = parsed.repos_url;
  res.send(session.username);
        }
      });
});

app.listen(8000, function () {
  console.log('App listening on port 8000!');
});
