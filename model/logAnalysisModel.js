var mongo = require(__dirname+'/../common/mongo.js');
var Schema = mongo._.Schema
var sessionGroupCntLog = new Schema(
    {
		_id: String,
		value: Number
    },{ collection: 'event_log' }
);
exports.sessionGroupCntLog = mongo._.model('sessionGroupCntLog',sessionGroupCntLog);

var eventHashGroupCntLog = new Schema(
    {
		_id: String,
		value: Number
    },{ collection: 'reco_log' }
);
exports.eventHashGroupCntLog = mongo._.model('eventHashGroupCntLog',eventHashGroupCntLog);


var eventLog = new Schema(
	{
		_id:String,
		label:String

	},{ collection: 'event_log'}
);

exports.eventLog = mongo._.model('eventLog',eventLog);

var recoResidenseLog = new Schema(
	{
		_id:String,
		residenseTime:String

	},{ collection: 'reco_log'}
);

exports.recoResidenseLog = mongo._.model('recoResidenseLog',recoResidenseLog);

var justRecoCntLog = new Schema(
	{
		_id:String

	},{ collection: 'reco_log'}
);

exports.justRecoCntLog = mongo._.model('justRecoCntLog',justRecoCntLog);

// var sessionGroupAllCntLog = new Schema(
//     {
// 		_id: String
//     },{ collection: 'event_log' }
// );
// exports.sessionGroupAllCntLog = mongo._.model('event_log',sessionGroupAllCntLog);

