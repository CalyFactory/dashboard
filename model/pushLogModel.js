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
		users:[usersSchema]

	}
);
module.exports = mongo._.model('admin_pushlogs',pushSchema);