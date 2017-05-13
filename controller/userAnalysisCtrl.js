const mysql = require('mysql');
var async = require('async');
var dbconfig = require(__dirname+'/../config/db-config.json');
var connection = mysql.createConnection(dbconfig);

exports.renderUserAnalysis = ( req, res, next ) => {
	const sess = req.session;
	if(!sess.name){
		res.redirect('/');
		return;
	}

	res.render('chartjs.html',{
		admin_name : sess.name
	});
}