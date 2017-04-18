module.exports = function(app)
{
	app.get('/',(req,res)=>{
		connection.query('select admin_id,admin_name from ADMINACCOUNT',(err, rows)=>{
			if(err) throw err;

			res.send(rows);
		})
	});
     /*app.get('/',function(req,res){
        res.render('index.html')
     });*/
     app.get('/pages/charts/chartjs.html',function(req,res){
        res.render('pages/charts/chartjs.html');
    });
}