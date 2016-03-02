var express = require('express');
var app = express();
var passport = require('passport');
var request = require('request');
var session = require('express-session');
var GitHubStrategy = require('passport-github2');
var bodyParser = require('body-parser');

var user = {};
user.username;
user.repos;
user.webhooks;

// Passport configurations
// setup Github strategy passport
passport.use(new GitHubStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: REDIRECT_URI
  },
  // 'verify' callback - accepts credentials and invokes a callback with user obj
  function (accessToken, refreshToken, profile, done) {
    // does everything asynchronously to emulate db 
    process.nextTick( function () {
      ACCESS_TOKEN = accessToken;
      return done(null, profile);
    });
  })
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});
// Express configurations
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//app.use(methodOverride());
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
// Initialize Passport!  Also use passport.session() middleware, to support

// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

// serve static assets
app.use(express.static(__dirname));

// redirect to login - for dev
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html'); 
});

// redirect to github for authorization using passport
// will redirect to /auth/callback
app.get('/login', 
        // use passport as middleware for route
        passport.authenticate('github', { scope: SCOPES }), 
        function(req, res) {
       // this function won't be called because it's being redirected to github
});

app.get('/logout', function (req, res) {
  req.logout();   
  res.redirect('/');
});

// authenticate using passport
app.get('/auth/callback', 
        passport.authenticate('github', { failureRedirect: '/' }),
        function (req, res) {
          res.redirect('/success');
});

// gets user info
app.get('/success', ensureAuthenticated, function(req, res) {
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

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};
// start server
app.listen(8000, function () {
  console.log('App listening on port 8000!');
});
