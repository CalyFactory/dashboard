var mongo = require(__dirname+'/../common/mongo.js');
var Schema = mongo._.Schema

var usersSchema = new Schema(
	{
    userId: String,
    loginPlatform: String,
    success: Number
	}
);
var pushSchema = new Schema(
	{
		pushText: String,
		pushTime: Date,
		pushSucCnt: Number,
		allUsers:Number,
		users:[usersSchema]

	},{collection:'admin_pushlogs'}
);
module.exports = mongo._.model('admin_pushlog',pushSchema);