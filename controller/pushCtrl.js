const userAccountModel = require(__dirname+'/../model/userAccountModel.js');
const userDeviceModel = require(__dirname+'/../model/userDeviceModel.js');
const fcm = require(__dirname+'/../common/fcm.js');
const pushLogModel = require(__dirname+'/../model/pushLogModel.js');
var util = require(__dirname+'/../common/util.js');


var mongo = require(__dirname+'/../common/mongo.js');
var moment = require('moment');


exports.initData = async (req, res, next) => {
	
	console.log('[pushCtrl]pushCtrl init Data')
	const sess = req.session;


	
	pushLogModel.find({} , function (err, data) {
	  if (err) return handleError(err);	  
	  push_logs = data
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
		push_users:push_users,
		push_log:push_logs,
        moment: moment

	})
	
};

exports.pushDetail =  async (req, res, next) => {
	const sess = req.session;

	const objectId = req.query.objectId 
	pushLogModel.find({_id: objectId } , function (err, data) {
	  if (err) return handleError(err);	  
	  pushDetailData = data
	  console.log(pushDetailData)
	})
	

	return res.render('pushDetail.html',{

		admin_name:sess.name,
		push_detail_data:pushDetailData,
        moment: moment

	})

}

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
		var successCnt = 0 ;
		for (var i = 0; i<rows.length;i++){
			
			pushResult = await fcm.send(rows[i].push_token,JSON.parse("{"+pushText+"}"))
			var userLog = {}
			userLog.userId = rows[i].user_id
			userLog.loginPlatform = rows[i].login_platform
			userLog.success = pushResult.success
			if(pushResult.success == 1){
				successCnt ++;
			}
			usersArray.push(userLog)
		}
				


		var pushLog = new pushLogModel({
			pushText:pushText,
			pushTime:util.getCurrentDateTime(),
			pushSucCnt:successCnt,
			allUsers:rows.length,
			users:usersArray
		});

	    pushLog.save().then(function (doc) {
	    	console.log('[pushCtrl]=>',doc)
	    });		
	    //codeReview
	    //곧 생김 이라는 status code가 있다. 고걸 넘겨줘보자.
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

