var mysql = require('mysql');
var dbconfig = require(__dirname+'/../config/db-config.json');
var connection = mysql.createConnection(dbconfig);

module.exports = function(app)
{
	/*app.get('/',function(req,res){
		connection.query('select admin_id,admin_name from ADMINACCOUNT',(err, rows)=>{
			if(err) throw err;

			res.send(rows);
		});
	});*/
	app.get('/',function(req,res){
		var total_register = 15;
		var yesterday_register = 3;

		res.render('index.html',{
			total_register : total_register,
			yesterday_register : yesterday_register,
			male : 20,
			female : 25,
			age_10 : 10,
			age_20 : 30,
			age_30 : 30,
			age_40 : 15
		});
	});
	app.get('/pages/charts/chartjs.html',function(req,res){
		res.render('pages/charts/chartjs.html');
    });
}