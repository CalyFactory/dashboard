const noticeModel = require(__dirname+'/../model/noticeModel.js');
const userAdminAccountModel = require(__dirname+'/../model/userAdminAccountModel.js');
// const fcm = require(__dirname+'/../common/fcm.js');
// const pushLogModel = require(__dirname+'/../model/pushLogModel.js');
var util = require(__dirname+'/../common/util.js');


// var mongo = require(__dirname+'/../common/mongo.js');
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
	// console.log('push=>',hasPush)
	
	try{
		adminAccount = await userAdminAccountModel.getUserAccount(userName)		
		result = await noticeModel.setNoti(title,contents,adminAccount[0].account_hashkey);			
		// if (hasPush){
		// 	rows = await userAccountModel.getPushUsers();			
		// }

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

