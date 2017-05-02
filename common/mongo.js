var mongoose = require('mongoose');
var dbconfig = require(__dirname+'/../config/db-config.json');
mongoose.connect('mongodb://'+dbconfig["mongoUser"]+':' + dbconfig["mongoPw"] + '@127.0.0.1/calydb?authSource=admin');
// console.log('mongodb://'+dbconfig["mongoUser"]+':' + dbconfig["mongoPw"] + '@127.0.0.1')
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

exports._ = mongoose

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