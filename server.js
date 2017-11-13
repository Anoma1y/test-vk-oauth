const express  			 = require('express');
const passport 			 = require('passport');
const session   		 = require('express-session');
const path     			 = require('path');
const http      		 = require('http');
const VKontakteStrategy  = require('passport-vkontakte').Strategy;

const count_friends = 5;
const PORT = 8080;
const app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/static'));
app.use(require('cookie-parser')());
app.use(require('body-parser')());
app.use(require('express-session')({ secret: 'secret vk key' }));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


passport.use('vkontakte', new VKontakteStrategy({

		scope: ['status', 'friends', 'notify'],
		profileFields: ['notify','photo_200_orig', 'city', 'bdate'],
        clientID: 6258656,
        clientSecret: "5Dkl8lysaBUp67Y9iTqx",
        callbackURL: "http://localhost:8080/auth/vk/callback"
    },    
	function verify(accessToken, refreshToken, params, profile, done) {
		process.nextTick(function () {

		const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
		const request = new XMLHttpRequest();

		request.open('GET', `https://api.vk.com/method/friends.get?order=random&count=${count_friends}&fields=name,photo_200_orig&user_id=${profile.id}&v=5.52`);
		request.onreadystatechange = function(e) {
		    if (this.readyState = 4) {
		        if (this.status == 200) {
		            const response = JSON.parse(this.responseText);
		            profile.friends = response
		        }
		    }
		}
		request.send(null);
		setTimeout(() => {return done(null, profile);},100)
	});
  }
));


passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id)
        .then(function (user) { done(null, user); })
        .catch(done);
});

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

app.get('/auth/vk',
  passport.authenticate('vkontakte', { scope: ['status', 'friends', 'notify'] }),
  function(req, res){

  });

app.get('/auth/vk/callback', 
  passport.authenticate('vkontakte', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}


http.createServer(app).listen(PORT, function () {
    console.log('Server listening on port ' + PORT);
});



