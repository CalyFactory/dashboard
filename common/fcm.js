var keyconfig = require(__dirname+'/../config/key.json');
var request = require('request');


exports.send = (pushToken,pushText) =>{
	console.log(pushToken)
	console.log(pushText)
	let pushtoken_data = {
		'to':pushToken,
		'data':{pushText}
	};
	console.log(pushtoken_data)
    return new Promise((resolve, reject) => {              
		request({
			method	: 'POST',
			uri 	: 'https://fcm.googleapis.com/fcm/send',
			headers	:
			{
				'Content-Type':'application/json',
				'Authorization':'key='+keyconfig.key
			},
			body 	: pushtoken_data,
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