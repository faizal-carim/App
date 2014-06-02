var myId;
var myName;
var challengerId;
var challengerName;
var questions;
var socket = io.connect('http://localhost:8000');
var score = -25;
var opponentScore = -25;

// DOM Ready =============================================================
$(document).ready(function() {
	
    //socket.connect();
	socket.on('news', function (data) {
		console.log("On the Client "+data.message);	
	});
	
	socket.on('challenged', function (data) {
		console.log("On the Client checking if I have been challenged");
		if(data.yourId == myId){
			challengerId = data.challengerId;
			challengerName = data.challengerName;
			console.log("It is me");
			$( "#challengeExplanation" ).html(data.message);
			$( "#challengePopup" ).popup( "open" );
		}
	});
	
	socket.on('responseReceived', function (data) {
		console.log("On the Client "+data.message);	
		console.log(myId + " " + data.yourId + " " + data.oppId);	
		if(data.yourId == myId || data.oppId == myId)
		{
			if(data.message == "denied"){
				//populateDeniedPopup();
				console.log("Telling the user he was denied");
					$('#infoLabel').html("Your challenge was declined - challenge another player");	
				//$( "#challengeDeniedPopup" ).popup( "open" )
			}
			else{
				console.log("The "+data.questions.length+" Questions have arrived ");
				score = -25;
				opponentScore = -25;
				questions = data.questions;
				if(challengerName == null)
					challengerName = data.challengerName;
				populateAcceptedDiv(questions);
				console.log("Game Board populated - your opponent is "+challengerName);
				$('#wrapper').hide();
				$( "#challengeAcceptedDiv" ).show();
				$('#infoLabel').html("");
				console.log("Showing Game Board");
			}
		}
	});
	
	socket.on('scoreReceived', function (data) {
		console.log("MY Id : "+myId+" may be same "+data.yourId); 
		if(data.yourId == myId)
		{
			console.log("On the Client Got my opposition score");
			opponentScore = data.score;
			if(score != -25){
				if(score > opponentScore)
					$('#scoreLabel').html("You Win - You scored "+score+" and "+challengerName+" scored "+opponentScore );
				else if(score < opponentScore)
					$('#scoreLabel').html("You Lose - You scored "+score+" and "+challengerName+" scored "+opponentScore );
				else
					$('#scoreLabel').html("Its a draw "+score+" and opponent "+challengerName+" "+opponentScore );	
			}
		}
	});
	
	socket.on('newUsersAdded', function (data) {
		console.log("New players have been added. Updating the players list");
		populateTable();
	});
	
	$('#wrapper').hide();
	$('#challengeAcceptedDiv').hide();
	
	//Loading the challenge Pop up incase theres a challenge
	populatePopup();
	
    // Populate the user table on initial page load
    //populateTable();
	
	// Add User button click
    $('#btnAddUser').on('click', addUser);
	
    // Delete User link click
    $('#userList table tbody').on('click', 'td a.linkchallengeuser', challengeUser);
});

// Functions =============================================================

// Fill the Popup with correct data
function populatePopup(){

	var popUpContent = '<div data-role="header" data-theme="b">';
	popUpContent    += '<h1>Challenge Received</h1>';
	popUpContent    += '</div>';
	popUpContent    += '<div role="main" class="ui-content">';
	popUpContent    += '<p id="challengeExplanation">You have been challenged</p>';
	popUpContent    += '<button href="#" id="declineButton" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back" data-role="button">Decline</button>';
	popUpContent    += '<button href="#" id="acceptButton" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b"  data-rel="back" data-role="button">Accept</button>';
	popUpContent    += ' </div>';
	
	 $('#challengePopup').html(popUpContent);
	 $('#declineButton').on('click', declineChallenge);
	 $('#acceptButton').on('click', acceptChallenge);
}

// Fill the Denied Popup with correct data
function populateDeniedPopup(){
	
	var popUpContent = '<div data-role="header" data-theme="b">';
	popUpContent    += '<h1>Your Challenge was denied</h1>';
	popUpContent    += '</div>';
	popUpContent    += '<div role="main" class="ui-content">';
	popUpContent    += '<button href="#" id="okButton" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-role="button" data-rel="back">OK</button>';
	popUpContent    += ' </div>';
	
	 $('#challengeDeniedPopup').html(popUpContent);
}

// Fill the Accepted DIV with correct data
function populateAcceptedDiv(questions)
{	
	var popUpContent = '<div data-role="header" data-theme="b">';
	popUpContent    += '<h1>Game On...</h1>';
	popUpContent    += '</div>';
	popUpContent    += '<div role="content" data-theme="b">';
	popUpContent    += '<h3 class="ui-title">In which year were these Movies Released?</h3>';
	
	for(var i = 0; i < questions.length; i++)
	{
		var question = questions[i];
		popUpContent    += '<b>' + question.question + '</b>' + '</br></br>';
		//Option 1
		popUpContent    += '<input type="radio" data-role="none" name="question'+(i+1)+'" value="'+question.option1+'">';
		popUpContent    += '<label value="'+question.option1+'" name="q'+(i+1)+'">'+question.option1+'</label>';	
		//Option 2
		popUpContent    += '<input type="radio" data-role="none" name="question'+(i+1)+'" value="'+question.option2+'">';
		popUpContent    += '<label value="'+question.option2+'" name="q'+(i+1)+'">'+question.option2+'</label>';	
		//Option 3
		popUpContent    += '<input type="radio" data-role="none" name="question'+(i+1)+'" value="'+question.option3+'">';
		popUpContent    += '<label value="'+question.option3+'" name="q'+(i+1)+'">'+question.option3+'</label>';	
		//Option 4
		popUpContent    += '<input type="radio" data-role="none" name="question'+(i+1)+'" value="'+question.option4+'">';
		popUpContent    += '<label value="'+question.option4+'" name="q'+(i+1)+'">'+question.option4+'</label>';
		
		popUpContent    += '</br>';
		popUpContent    += '</br>';	
		popUpContent    += '</br>';	
	}
	
	popUpContent    += '<button href="#" id="doneButton" class="ui-btn ui-shadow ui-btn-corner-all ui-btn-hover-b ui-btn-up-b" data-rel="back" data-role="button" style="width:100%;height: 40px;" data-theme="b">Done</button>';
	popUpContent    += '<label id="errorLabel" style="color: red;font-weight: bold;"></label>';
	popUpContent    += '<label id="scoreLabel" style="font-weight: bold;color: darkslateblue;"></label>';
	popUpContent    += ' </div>';
	
	 $('#challengeAcceptedDiv').html(popUpContent);
	 $('#doneButton').on('click', tallyScore);
}

// Decline the Challenge
function tallyScore(event) 
{
	console.log("Tallying the score");
	
	score = 0;
	
	for(var j = 0; j < 8; j++)
	{
		var qname = "question"+(j+1);
		var qlabel = "q"+(j+1);
		var question = questions[j];
		var qradio = document.getElementsByName(qname);
		var qValue = "-1";
		for(var i = 0; i < qradio.length; i++){
			if(qradio[i].checked){
				qValue = qradio[i].value;
			}
		}
		
		//If there is an unanswered question
		if(qValue == "-1")
		{
			$('#errorLabel').html("Please answer all questions.");
			return;
		}
		//End
		
		$('#errorLabel').html("");
		
		//This bit of code here shows the user the correct Answers
		var qlabels = document.getElementsByName(qlabel);
		for(var i = 0; i < qlabels.length; i++)
		{
			if(qlabels[i].innerText == question.correctAnswer){
				qlabels[i].style.color = "green";
				qlabels[i].style.fontWeight = "900";
			}
		}
		//End
		
		
		console.log("Users answer for  "+qname+" is "+qValue+" The correct answer is "+question.correctAnswer);
		if(qValue == question.correctAnswer)
			score += 5;
		else
			score -= 3;
	}
	console.log("MY ID "+myId+"   His ID "+challengerId);
	socket.emit('scoreSubmission', { message: "This is my score", challengerId : myId, opponentId : challengerId, score : score });	
	
	$('#doneButton').on('click', goBack);
			
	if(opponentScore != -25){
		if(score > opponentScore)
			$('#scoreLabel').html("You Win - You scored "+score+" and "+challengerName+" scored "+opponentScore );
		else if(score < opponentScore)
			$('#scoreLabel').html("You Lose - You scored "+score+" and "+challengerName+" scored "+opponentScore );
		else
			$('#scoreLabel').html("Its a draw - You scored "+score+" and "+challengerName+" scored "+opponentScore );	
	}
	else{
		$('#scoreLabel').html("You Scored "+score+" - Waiting for "+challengerName+"'s Score...");
	}	
}

// GO Back
function goBack(event) {
	challengerId = null;
	questions = null;
	score = -25;
	opponentScore = -25;
	
	
	$('#challengeAcceptedDiv').hide();
	$('#wrapper').show();
	$('#infoLabel').html("");	
}

// Decline the Challenge
function declineChallenge(event) {
	$( "#challengePopup" ).popup( "close" )
	console.log("challenge denied "+myId+" "+challengerId);
	socket.emit('challengeResponse', { message: "decline", challengerId : challengerId, myId : myId , myName : myName});
	challengerId = null;
	challengerName = null;
}

// Accept the Challenge
function acceptChallenge(event) {
	$( "#challengePopup" ).popup( "close" )
	console.log("challenge accepted");
	socket.emit('challengeResponse', { message: "accept", challengerId : challengerId, myId : myId , myName : myName});
}

// Fill table with data
function populateTable() { 

    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/users/userlist', function( data ) {
       
        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
			if(this._id != myId)
            {
				tableContent += '<tr>';
				tableContent += '<td>'+ this.username + '</td>';
				tableContent += '<td>' + this.location + '</td>';
				tableContent += '<td><a href="#" class="linkchallengeuser" rel="' + this._id + '">Challenge</a></td>';
				tableContent += '</tr>';
			}
        });

        // Inject the whole content string into our existing HTML table
        $('#userList table tbody').html(tableContent);
		
    });
};


// Add User
function addUser(event) {
    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    $('#addUser input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });

    // Check and make sure errorCount's still at zero
    if(errorCount === 0) {

        // If it is, compile all user info into one object
        var newUser = {
            'username': $('#addUser fieldset input#inputUserName').val(),
            'location': $('#addUser fieldset input#inputUserLocation').val()
        }

        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            data: newUser,
            url: '/users/adduser',
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg === '') {

                // Clear the form inputs
                $('#addUser fieldset input').val('');
				myId = response.myId;
				myName = response.myName;
                // Update the table
                populateTable();
				$('#wrapper').show();
				$('#addUser').hide();
				$('#welcomePlayer').html("Welcome to the Movie Quiz "+myName);
				socket.emit('adduser', { message: "User Added", id : myId});

            }
            else {

                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);

            }
        });
    }
    else {
        // If errorCount is more than 0, error out
        //alert('Please fill in all fields');
		$('#complateAll').html("Please complete all fields");
        return false;
    }
};

//Challenge User
function challengeUser(event){

	event.preventDefault();
	var opponentId = $(this).attr('rel');
	challengerId = $(this).attr('rel');
	console.log("Sending Challenge Request");
	$('#infoLabel').html("Sending challenge request - waiting for response...");
	socket.emit('challenge', { message: "The Challenge has been laid down", challengerId : myId, opponentId : challengerId, challengerName : myName });
}


// Delete User
function deleteUser(event) {

    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this user?');

    // Check and make sure the user confirmed
    if (confirmation === true) {

        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/users/deleteuser/' + $(this).attr('rel')
        }).done(function( response ) {

            // Check for a successful (blank) response
            if (response.msg === '') {
            }
            else {
                alert('Error: ' + response.msg);
            }

            // Update the table
            populateTable();

        });

    }
    else {

        // If they said no to the confirm, do nothing
        return false;

    }

};
