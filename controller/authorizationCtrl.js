const mysql = require('mysql');
var async = require('async');
var dbconfig = require(__dirname+'/../config/db-config.json');
var connection = mysql.createConnection(dbconfig);

exports.adminAccess = ( req, res, next ) => {
	const sess = req.session;

	if(sess.name)
		res.redirect('/dashboard');
	else
		res.render('login.html',{error:null});
}

exports.adminLogin = ( req, res, next ) => {
	const sess = req.session;

	connection.query('select admin_name from ADMINACCOUNT where admin_id=\''+req.body.adminId+'\' and admin_pw=\''+req.body.password+'\'',(err,rows)=>{
		if(rows.length>0){
			sess.name = rows[0].admin_name;
			res.redirect('/dashboard');
		}
		else{
			res.render('login.html',{error: "Input wrong id or password"});
		}
	});
}

exports.adminLogout = ( req, res, next ) => {
	const sess = req.session;

	if(sess.name){
		req.session.destroy((err)=>{
			if(err){
				console.log(err);
			}else{
				res.redirect('/');
			}
		})
	}else{
		res.redirect('/');
	}
}