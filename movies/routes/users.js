var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectID;

/*
 * GET userlist.
 */
router.get('/userlist', function(req, res) {
    var db = req.db;
    db.collection('userlist').find().toArray(function (err, items) {
        res.json(items);
    });
});

/*
 * POST to adduser.
 */
router.post('/adduser', function(req, res) {
    var db = req.db;
    db.collection('userlist').insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '', myId : result[0]._id, myName : result[0].username } : { msg: err }
        );
    });
	
});

/*
 * DELETE to deleteuser.
 */
router.delete('/deleteuser/:id', function(req, res) {
    var db = req.db;
    var userToDelete = req.params.id;
    db.collection('userlist').removeById(userToDelete, function(err, result) {
        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});

/*
 * POST to challengeuser.
 */
router.post('/challengeuser/:id/:myId', function(req, res) {
    var db = req.db;
    var userToChallenge = req.params.id;
	var challenger = req.params.myId;
	var finalResult;
	var finalError;
	
	console.log("My ID : "+challenger + " and Opponent ID " + userToChallenge);
	
	db.collection('userlist').update( 
		{ "_id": ObjectId(userToChallenge) },{$set: {challenged: "true", opponentId: challenger}  }, 
		function(err, result) 
		{
			if(result === 1)
			    finalResult = 1;
			finalError = err;
			
		}
	);
	
	db.collection('userlist').update( 
		{ "_id": ObjectId(challenger) }, {$set: {challenged: "true", opponentId: userToChallenge} }, 
		function(err, result) 
		{
			if(result === 1)
			    finalResult = 1;
			finalError = err;
    	}
	);
	
	console.log(finalResult);
	res.send({ msg: '' });

});



module.exports = router;
