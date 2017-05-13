var mysql = require('mysql');
var async = require('async');
var dbconfig = require(__dirname+'/../config/db-config.json');
var connection = mysql.createConnection(dbconfig);


var pushCtrl = require(__dirname+'/../controller/pushCtrl.js');
var notiCtrl = require(__dirname+'/../controller/notiCtrl.js');
var logCtrl = require(__dirname+'/../controller/logCtrl.js');
var dashboardCtrl = require(__dirname+'/../controller/dashboardCtrl.js');
var authorCtrl = require(__dirname+'/../controller/authorizationCtrl.js');
var recoAnalysisCtrl = require(__dirname+'/../controller/recoAnalysisCtrl.js');
var userAnalysisCtrl = require(__dirname+'/../controller/userAnalysisCtrl.js');

module.exports = function(app)
{

	app.route('/').get(authorCtrl.adminAccess)
	app.route('/login').post(authorCtrl.adminLogin)
	app.route('/logout').get(authorCtrl.adminLogout)
	app.route('/dashboard').get(dashboardCtrl.renderDashboard)
	app.route('/reco-analysis').get(recoAnalysisCtrl.renderRecoAnalysis)
	app.route('/user-analysis').get(userAnalysisCtrl.renderUserAnalysis)
	

    //dev.caly.io:555566/push 
    app.route('/push').get(pushCtrl.initData)
    app.route('/pushDetail').get(pushCtrl.pushDetail)

    app.route('/notification').get(notiCtrl.initData)
    app.route('/v1.0/noti/setNoti').post(notiCtrl.setNoti)
    
    app.route('/v1.0/push/send').post(pushCtrl.sendPush)

    app.route('/log').get(logCtrl.initData)

}