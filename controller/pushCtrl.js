const userAccountModel = require(__dirname+'/../model/userAccountModel.js');
const userDeviceModel = require(__dirname+'/../model/userDeviceModel.js');
const fcm = require(__dirname+'/../common/fcm.js');
const pushLogModel = require(__dirname+'/../model/pushLogModel.js');
var util = require(__dirname+'/../common/util.js');


var mongo = require(__dirname+'/../common/mongo.js');


exports.initData = async (req, res, next) => {
	
	console.log('[pushCtrl]pushCtrl init Data')
	const sess = req.session;

	
	pushLogModel.find({} , function (err, data) {
	  if (err) return handleError(err);
	  
	  console.log(data)
	})







	
	try{
		let result = '';

		push_users = await userAccountModel.getPushUsers();			

	}catch(err){	
		console.log(err)	
		return res.json({
			"status":false,
			"message":err
		})	  	
	}

	return res.render('push.html',{
		admin_name:sess.name,
		push_users:push_users
	})
	
};

exports.sendPush = async (req, res, next) => {
	
	console.log('[pushCtrl]sendPush')
	const users = req.body.users;
	const pushText = req.body.pushText;
	//login platform 확인해야함.
	
	console.log('[pushCtrl]=>',users)
	console.log('[pushCtrl]=>',pushText)
	pushText.replace(/[\r\n]/g, '');


	try{
		let result = '';
		rows = await userDeviceModel.getPushToken(JSON.parse(users));			
		console.log(rows)

		var usersArray = []
		for (var i = 0; i<rows.length;i++){
			pushResult = await fcm.send(rows[i].push_token,pushText)
			var userLog = {}
			userLog.userId = rows[i].user_id
			userLog.loginPlatform = rows[i].login_platform
			userLog.success = pushResult.success
			usersArray.push(userLog)
		}
				


		var pushLog = new pushLogModel({
			pushText:pushText,
			pushTime:util.getCurrentDateTime(),
			users:usersArray
		});

	    pushLog.save().then(function (doc) {
	    	console.log('[pushCtrl]=>',doc)
	    });		

		return res.json({
		  	"status":true,
		  	"message": pushResult
	 	})

	}catch(err){	
		console.log(err)	
		return res.json({
			"status":false,
			"message":err
		})	  	
	}
	
};

