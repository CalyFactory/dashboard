exports.getCurrentDateTime = () => {

	var date = new Date().getTime();
	date += (9 * 60 * 60 * 1000);
	// console.log(new Date(date).toUTCString());
	return new Date(date).toUTCString();
}

    // var uri = 'mongodb://localhost:27017/mongoose_test';
    // // Use bluebird
    // var options = { promiseLibrary: require('bluebird') };
    // var db = mongoose.createConnection(uri, options);

    // Band = db.model('band-promises', { name: String });

    // db.on('open', function() {
    //   assert.equal(Band.collection.findOne().constructor, require('bluebird'));
    // });


// exports.send = (pushTokens,pushText) =>{
// 	console.log(pushTokens)
// 	console.log(pushText)
// 	let pushtoken_data = {
// 		'registration_ids':pushTokens,
// 		'data':{pushText}
// 	};
// 	console.log(pushtoken_data)
//     return new Promise((resolve, reject) => {              
// 		request({
// 			method	: 'POST',
// 			uri 	: 'https://fcm.googleapis.com/fcm/send',
// 			headers	:
// 			{
// 				'Content-Type':'application/json',
// 				'Authorization':'key='+keyconfig.key
// 			},
// 			body 	: pushtoken_data,
// 			json 	: true
// 		},function (error, response, body) {
// 		    if (error) {
// 		      	reject(error)
// 			}
// 			resolve(body);	
// 			console.log('Upload successful!  Server responded with:', body);
// 		})	
// 	})
// }