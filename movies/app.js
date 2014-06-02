var express = require('express');
var path = require('path');
var http = require('http');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var cheerio = require('cheerio');

// Database
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/movies", {native_parser:true});

var routes = require('./routes/index');
var users = require('./routes/users');
var app = express();
var movies = [];

//Movie Code
console.log("Fetching Movies... I will tell you when I have them.... Wait....");
request('http://www.imdb.com/chart/top?ref_=nb_mv_3_chttp', function (error, response, html) {
	if (!error && response.statusCode == 200) {
		var $ = cheerio.load(html);
		$('span.secondaryInfo').each(function(i, element){
			//if( valueinArray(i, indexes) )
			//{
			  var a = $(this).prev();
			  var b = $(this);
			  var movie = {title : a.text(), year : b.text().substring(1, 5)};
			  movies.push(movie);
			  //console.log(i+". "+a.text()+" - "+b.text().substring(1, 5)+" answers "+randomiseAnswers(b.text().substring(1, 5)));
			//}
		});

		console.log(movies.length+" Movies have been added");
	}
});

function randomiseAnswers(year){
	var answers = [];
	
	var randomNumber = Math.floor(Math.random()*4) + 1;//Random Numbers between 1-4
	if(randomNumber == 1){
		answers[0] = parseInt(year);
		answers[1] = parseInt(year) + 2;
		answers[2] = parseInt(year) + 4;
		answers[3] = parseInt(year) + 6;
	}
	else if(randomNumber == 2){
		answers[0] = parseInt(year) - 2;
		answers[1] = parseInt(year);
		answers[2] = parseInt(year) + 2;
		answers[3] = parseInt(year) + 4;
	}
	else if(randomNumber == 3){
		answers[0] = parseInt(year) - 4;
		answers[1] = parseInt(year) - 2;
		answers[2] = parseInt(year);
		answers[3] = parseInt(year) + 2;
	}
	else if(randomNumber == 4){
		answers[0] = parseInt(year) - 6;
		answers[1] = parseInt(year) - 4;
		answers[2] = parseInt(year) - 2;
		answers[3] = parseInt(year);
	}
	
	return answers;
}

function getQuestions()
{	
	var indexes = [];
	for(var i = 0; i < 8; i++)
	{
		var randomNumber = Math.floor(Math.random()*250) + 1;//Random Numbers between 1-250
		indexes[i] = randomNumber;
	}
	
	var questions = [];
	
	for(var j = 0; j < 8; j++)
	{
		
		var movie = movies[indexes[j]];
		var answers = [];
		answers = randomiseAnswers(movie.year);
		var question = {question : movie.title, correctAnswer : movie.year, option1 : answers[0], option2 : answers[1], option3 : answers[2], option4 : answers[3]};
		questions.push(question);
	}
	
	return questions;
}
//End Movie Code

//Socket Code
var server = http.createServer(app);
var io = require('socket.io').listen(server);

app.listen(app.get('port'), function(){
   console.log("Express server listening on port " + app.get('port'));
});

io.sockets.on('connection', function (socket) {
  console.log('client connected');
  socket.emit('news', { message : 'welcome to the world' });
  socket.on('challenge', function (data) {
    console.log("On the Server "+data.message+" by "+data.challengerId+" to "+data.opponentId);
	socket.broadcast.emit('challenged', { message: "You have been challenged by "+data.challengerName, challengerId : data.challengerId, yourId : data.opponentId, challengerName : data.challengerName });
  });
	
	socket.on('challengeResponse', function (data) {
	console.log("On the Server "+data.message+" by "+data.challengerId+" to "+data.myId);
	if(data.message == "decline"){
		socket.broadcast.emit('responseReceived', { message: "denied", yourId : data.challengerId, oppId : data.myId , challengerName : data.myName});
	}
	else{
		var questions = getQuestions();
		console.log(questions.length+" Have been generated");
		io.sockets.emit('responseReceived', { message: "accepted", yourId : data.challengerId, oppId : data.myId, questions : questions , challengerName : data.myName });
	}
  	});
	
	socket.on('scoreSubmission', function (data) {
		console.log("Score Received");
		socket.broadcast.emit('scoreReceived', { message: "received", yourId : data.opponentId, oppId : data.challengerId, score : data.score });
	});
	
	socket.on('adduser', function(data) {
		socket.set('user', data.id, function() {});
		socket.broadcast.emit('newUsersAdded', { message: "new players available"});
	  });

	
	socket.on('disconnect', function () {
		socket.get('user', function(err, userId) {
			 console.log('Deleting '+userId);
      		 db.collection('userlist').removeById(userId, function(err, result) {});
       	});
    });
	
});

server.listen(8000);
//End of Socket Code


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use('/', routes);
app.use('/users', users);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
