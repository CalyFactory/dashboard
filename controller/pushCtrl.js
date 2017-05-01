const userAccountModel = require(__dirname+'/../model/userAccountModel.js');
const userDeviceModel = require(__dirname+'/../model/userDeviceModel.js');
const fcm = require(__dirname+'/../common/fcm.js');


exports.initData = async (req, res, next) => {
	
	console.log('[pushCtrl]pushCtrl init Data')
	const sess = req.session;

	try{
		let result = '';

		push_users = await userAccountModel.getPushUsers();			
		// return res.json({
		//   	"status":true,
		//   	"message":push_users
	 // 	})

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
	
	console.log(users)
	console.log(pushText)
	pushText.replace(/[\r\n]/g, '');


	try{
		let result = '';
		rows = await userDeviceModel.getPushToken(JSON.parse(users));			
		console.log(rows)
		arrPush = new Array()
		for (var i = 0; i<rows.length;i++){
			arrPush.push(rows[i].push_token)	
		}
		
		pushResult = await fcm.send(arrPush,pushText)

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

