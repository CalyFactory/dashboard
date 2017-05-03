var keyconfig = require(__dirname+'/../config/key.json');
var request = require('request');


exports.send = (pushToken,pushText) =>{
	console.log('token =>' + pushToken)
	console.log('pushText=>'+JSON.stringify(pushText))
	var pushData = {}

	pushData.to = pushToken
	pushData.data = pushText

    return new Promise((resolve, reject) => {              
		request({
			method	: 'POST',
			uri 	: 'https://fcm.googleapis.com/fcm/send',
			headers	:
			{
				'Content-Type':'application/json',
				'Authorization':'key='+keyconfig.key
			},
			body 	: pushData,
			json 	: true
		},function (error, response, body) {
		    if (error) {
		      	reject(error)
			}
			resolve(body);	
			console.log('Upload successful!  Server responded with:', body);

		})	
	})
}

