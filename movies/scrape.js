var request = require('request');
var cheerio = require('cheerio');

var movies = [];

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

function getMovies()
{
	console.log("Fetching Movies...");
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
}

module.exports = scrape;