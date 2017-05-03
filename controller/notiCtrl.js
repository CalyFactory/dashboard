const noticeModel = require(__dirname+'/../model/noticeModel.js');
const userAdminAccountModel = require(__dirname+'/../model/userAdminAccountModel.js');
const userDeviceModel = require(__dirname+'/../model/userDeviceModel.js');
const fcm = require(__dirname+'/../common/fcm.js');
const pushLogModel = require(__dirname+'/../model/pushLogModel.js');
var util = require(__dirname+'/../common/util.js');

var util = require(__dirname+'/../common/util.js');
var moment = require('moment');


exports.initData = async (req, res, next) => {
	
	console.log('[pushCtrl]pushCtrl init Data')
	const sess = req.session;

	
	try{

		noti_data = await noticeModel.getNoti();			

	}catch(err){	
		console.log(err)	
		return res.json({
			"status":false,
			"message":err
		})	  	
	}

	return res.render('noti.html',{

		admin_name:sess.name,
		noti_data:noti_data,
        moment: moment

	})
	
};

exports.setNoti =  async (req, res, next) => {
	const title = req.body.title;
	const contents = req.body.contents;
	// const userName = req.body.userName;

	const hasPush = req.body.hasPush;
	const userName = '최평강'
	console.log('title=>',title)
	console.log('contents=>',contents)
	
	try{
		adminAccount = await userAdminAccountModel.getUserAccount(userName)		

		var usersArray = []
		result = await noticeModel.setNoti(title,contents,adminAccount[0].account_hashkey);			
		if (hasPush){
			pushText = {
				type:"noti",
				title:title,
				contents:contents
			}

			users = await userDeviceModel.getAllUsers();	
			console.log(users)
			for (var i = 0 ; i<users.length;i++){		
				//푸시가 안감!!!!!!!!!!!! 왜안가지
				pushResult = await fcm.send(users[i].push_token,pushText)
				
				var userLog = {}
				var successCnt = 0 ;

				userLog.userId = users[i].user_id
				userLog.loginPlatform = users[i].login_platform
				userLog.success = pushResult.success
				if(pushResult.success == 1){
					successCnt ++;
				}
				usersArray.push(userLog)					
			}
			// console.log(pushText)
			// console.log(successCnt)
			// console.log(users.length)
			// console.log(usersArray)
			var pushLog = new pushLogModel({
				pushText:JSON.stringify(pushText),
				pushTime:util.getCurrentDateTime(),
				pushSucCnt:successCnt,
				allUsers:users.length,
				users:usersArray
			});
			// console.log('type->',typeof(pushText))
		    await pushLog.save().then(function (doc) {		    	
				return res.json({
					"status":200,
					"message":pushResult
				})				

		    });					

		}

	}catch(err){	
		console.log(err)	
		return res.json({
			"status":400,
			"message":err
		})	  	
	}

		return res.json({
			"status":200,
			"message":result
		})	
}

