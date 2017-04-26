var mysql = require('mysql');
var async = require('async');
var dbconfig = require(__dirname+'/../config/db-config.json');
var connection = mysql.createConnection(dbconfig);

module.exports = function(app)
{
	app.get('/dashboard',(req,result)=>{
		sess = req.session;
		if(!sess.name)
			result.redirect('/');

		var totalRegister 		= 0;
		var yesterdayRegister 	= 0;
		var reactTimeMin 		= 0;
		var reactTimeSec		= 0;
		var timeTheDay 			= [];
		var timeTheWeek 		= [];
		var timeTheMonth 		= [];

		var syncCost20 = {};
		var syncCost40 = {};
		var syncCost60 = {};

		var maleCount	= 0;
		var femaleCount	= 0;

		var age10count	= 0;
		var age20count	= 0;
		var age30count	= 0;
		var age40count	= 0;

		var userFeedback = [];
		var outUserFeedback = [];

		var southReco 	 = {};
		var northReco 	 = {};
		var centeralReco = {};
		var eastReco	 = {};
		var westReco	 = {};

		var today = new Date();
		var yesterday = new Date(new Date().setDate(new Date().getDate()-1));
		var previous2days = new Date(new Date().setDate(new Date().getDate()-2));
		var previous3days = new Date(new Date().setDate(new Date().getDate()-3));
		var previous4days = new Date(new Date().setDate(new Date().getDate()-4));
		var previous5days = new Date(new Date().setDate(new Date().getDate()-5));
		var previous6days = new Date(new Date().setDate(new Date().getDate()-6));
		var previous7days = new Date(new Date().setDate(new Date().getDate()-7));
		var previous14days = new Date(new Date().setDate(new Date().getDate()-14));
		var previous21days = new Date(new Date().setDate(new Date().getDate()-21));
		var previous28days = new Date(new Date().setDate(new Date().getDate()-28));

		async.parallel([
			function(callback){
				// Get total_register count
				connection.query(`select count(*) as total_user_count from USER as U
					inner join USERACCOUNT as UA
						on U.user_hashkey = UA.user_hashkey
					where user_id != 'None'`,(err, rows)=>{
							if(err) throw err;

					totalRegister = rows[0].total_user_count;
					callback(err, rows);
				});
			},
			function(callback){
			// Get yesterday_register count
				connection.query(`select count(*) as yesterday_user_count from USER as U
					inner join USERACCOUNT as UA
						on U.user_hashkey = UA.user_hashkey
					where user_id != 'None'
						and UA.create_datetime > STR_TO_DATE('`+yesterday.getFullYear()+'/'+(yesterday.getMonth()+1)+'/'+yesterday.getDate()+` 0:0:0','%Y/%m/%e %k:%i:%s') 
						and UA.create_datetime < STR_TO_DATE('`+yesterday.getFullYear()+'/'+(yesterday.getMonth()+1)+'/'+yesterday.getDate()+` 23:59:59','%Y/%m/%e %k:%i:%s')`,(err, rows)=>{
					if(err) throw err;

					yesterdayRegister = rows[0].yesterday_user_count;
					callback(err, rows);
				});
			},
			function(callback){
				// Get react_times about mapping
				connection.query('select react_times from EVENT_RECO',(err, rows)=>{
					if(err) throw err;
					var sum=0;
					for(var i=0; i<rows.length; i++){
						sum += rows[i].react_times;
					}
					var reactTime = Math.floor(sum/rows.length);
					reactTimeMin = Math.floor(reactTime/60);
					reactTimeSec = reactTime%60;
					callback(err, rows);
				});
			},
			function(callback){
				// Get user-feedback(type 0) & out-user-feedback(type 1)
				connection.query(`select 
						UA.user_id,
						R.contents,
						R.created,
						R.type
					from REQUESTS as R
					inner join USERACCOUNT as UA
						on R.account_hashkey = UA.account_hashkey
					`,(err, rows)=>{
					//where UA.user_id != 'None'`,(err, rows)=>{
					if(err) throw err;


					for(var i=0; i<rows.length; i++){
						if(rows[i].type === 0){
							userFeedback.push({
								user_id : 	rows[i].user_id,
								contents: 	rows[i].contents,
								created : 	rows[i].created 	
							});
						}
						else{
							outUserFeedback.push({
								user_id : 	rows[i].user_id,
								contents: 	rows[i].contents,
								created : 	rows[i].created 	
							});
						}
					}
					callback(err, rows);
				});		
			},
			function(callback){
				// Get gender & ages
				connection.query(`select 
						user_gender,user_birth 
					from USER as U
					inner join USERACCOUNT as UA
						on U.user_hashkey = UA.user_hashkey
					group by UA.account_hashkey`,(err, rows)=>{
					if(err) throw err;

					var year = new Date().getFullYear();

					for(var i=0; i<rows.length; i++){
						if(rows[i].user_gender === 1)
							maleCount++;
						else
							femaleCount++;

						if(rows[i].user_birth > (year-19))
							age10count++;
						if(rows[i].user_birth > (year-29))
							age20count++;
						if(rows[i].user_birth > (year-39))
							age30count++;
						if(rows[i].user_birth > (year-49))
							age40count++;
					}
					callback(err, rows);
				});
			},
			function(callback){
				// Get main-detail region
				connection.query(`select
					R.main_region,
					R.region,
					(select count(*) from RECOMMENDATION as RECO where RECO.region = R.region ) 
					as detail_region_count
				from RECOMMENDATION as R
				where
					R.main_region != 'NULL'
					or R.main_region != 'None'
				group by R.main_region, R.region
				`,(err, rows)=>{
					if(err) throw err;
					for(var i=0; i<rows.length; i++){
						if(rows[i].main_region === "남부"){
							southReco[rows[i].region]=rows[i].detail_region_count;
						}
						else if(rows[i].main_region === "북부"){
							northReco[rows[i].region]=rows[i].detail_region_count;	
						}
						else if(rows[i].main_region === "중부"){
							centeralReco[rows[i].region]=rows[i].detail_region_count;
						}
						else if(rows[i].main_region === "동부"){
							eastReco[rows[i].region]=rows[i].detail_region_count;
						}
						else if(rows[i].main_region === "서부"){
							westReco[rows[i].region]=rows[i].detail_region_count;
						}
						else;
						//console.log(rows[i].main_region+":"+rows[i].region+" "+rows[i].detail_region_count);
					}

					callback(err, rows);
				});
			},
			function(callback){
				// Get sync timezone
				connection.query(`select
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 6:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 6:59:59','%Y/%m/%e %k:%i:%s'))
					 as yesterday6clock,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 7:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 7:59:59','%Y/%m/%e %k:%i:%s'))
					 as yesterday7clock,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 8:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 8:59:59','%Y/%m/%e %k:%i:%s'))
					 as yesterday8clock,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 9:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 9:59:59','%Y/%m/%e %k:%i:%s'))
					 as yesterday9clock,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 10:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 10:59:59','%Y/%m/%e %k:%i:%s'))
					 as yesterday10clock,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 11:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 11:59:59','%Y/%m/%e %k:%i:%s'))
					 as yesterday11clock,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 12:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 12:59:59','%Y/%m/%e %k:%i:%s'))
					 as yesterday12clock,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 13:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 13:59:59','%Y/%m/%e %k:%i:%s'))
					 as yesterday13clock,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 14:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 14:59:59','%Y/%m/%e %k:%i:%s'))
					 as yesterday14clock,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 15:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 15:59:59','%Y/%m/%e %k:%i:%s'))
					 as yesterday15clock,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 16:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 16:59:59','%Y/%m/%e %k:%i:%s'))
					 as yesterday16clock,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 17:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 17:59:59','%Y/%m/%e %k:%i:%s'))
					 as yesterday17clock,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 18:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 18:59:59','%Y/%m/%e %k:%i:%s'))
					 as yesterday18clock,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 19:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 19:59:59','%Y/%m/%e %k:%i:%s'))
					 as yesterday19clock,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 20:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 20:59:59','%Y/%m/%e %k:%i:%s'))
					 as yesterday20clock,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 21:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 21:59:59','%Y/%m/%e %k:%i:%s'))
					 as yesterday21clock,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 22:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 22:59:59','%Y/%m/%e %k:%i:%s'))
					 as yesterday22clock,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 23:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 23:59:59','%Y/%m/%e %k:%i:%s'))
					 as yesterday23clock,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+today.getFullYear()+`/`+(today.getMonth()+1)+`/`+today.getDate()+` 0:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+today.getFullYear()+`/`+(today.getMonth()+1)+`/`+today.getDate()+` 0:59:59','%Y/%m/%e %k:%i:%s'))
					 as today0clock,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+today.getFullYear()+`/`+(today.getMonth()+1)+`/`+today.getDate()+` 1:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+today.getFullYear()+`/`+(today.getMonth()+1)+`/`+today.getDate()+` 1:59:59','%Y/%m/%e %k:%i:%s'))
					 as today1clock,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+today.getFullYear()+`/`+(today.getMonth()+1)+`/`+today.getDate()+` 2:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+today.getFullYear()+`/`+(today.getMonth()+1)+`/`+today.getDate()+` 2:59:59','%Y/%m/%e %k:%i:%s'))
					 as today2clock,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+today.getFullYear()+`/`+(today.getMonth()+1)+`/`+today.getDate()+` 3:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+today.getFullYear()+`/`+(today.getMonth()+1)+`/`+today.getDate()+` 3:59:59','%Y/%m/%e %k:%i:%s'))
					 as today3clock,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+today.getFullYear()+`/`+(today.getMonth()+1)+`/`+today.getDate()+` 4:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+today.getFullYear()+`/`+(today.getMonth()+1)+`/`+today.getDate()+` 4:59:59','%Y/%m/%e %k:%i:%s'))
					 as today4clock,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+today.getFullYear()+`/`+(today.getMonth()+1)+`/`+today.getDate()+` 5:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+today.getFullYear()+`/`+(today.getMonth()+1)+`/`+today.getDate()+` 5:59:59','%Y/%m/%e %k:%i:%s'))
					 as today5clock,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 0:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 23:59:59','%Y/%m/%e %k:%i:%s'))
					 as yesterday,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+previous2days.getFullYear()+`/`+(previous2days.getMonth()+1)+`/`+previous2days.getDate()+` 0:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+previous2days.getFullYear()+`/`+(previous2days.getMonth()+1)+`/`+previous2days.getDate()+` 23:59:59','%Y/%m/%e %k:%i:%s'))
					 as previous2days,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+previous3days.getFullYear()+`/`+(previous3days.getMonth()+1)+`/`+previous3days.getDate()+` 0:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+previous3days.getFullYear()+`/`+(previous3days.getMonth()+1)+`/`+previous3days.getDate()+` 23:59:59','%Y/%m/%e %k:%i:%s'))
					 as previous3days,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+previous4days.getFullYear()+`/`+(previous4days.getMonth()+1)+`/`+previous4days.getDate()+` 0:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+previous4days.getFullYear()+`/`+(previous4days.getMonth()+1)+`/`+previous4days.getDate()+` 23:59:59','%Y/%m/%e %k:%i:%s'))
					 as previous4days,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+previous5days.getFullYear()+`/`+(previous5days.getMonth()+1)+`/`+previous5days.getDate()+` 0:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+previous5days.getFullYear()+`/`+(previous5days.getMonth()+1)+`/`+previous5days.getDate()+` 23:59:59','%Y/%m/%e %k:%i:%s'))
					 as previous5days,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+previous6days.getFullYear()+`/`+(previous6days.getMonth()+1)+`/`+previous6days.getDate()+` 0:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+previous6days.getFullYear()+`/`+(previous6days.getMonth()+1)+`/`+previous6days.getDate()+` 23:59:59','%Y/%m/%e %k:%i:%s'))
					 as previous6days,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+previous7days.getFullYear()+`/`+(previous7days.getMonth()+1)+`/`+previous7days.getDate()+` 0:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+previous7days.getFullYear()+`/`+(previous7days.getMonth()+1)+`/`+previous7days.getDate()+` 23:59:59','%Y/%m/%e %k:%i:%s'))
					 as previous7days,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+previous7days.getFullYear()+`/`+(previous7days.getMonth()+1)+`/`+previous7days.getDate()+` 0:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` 23:59:59','%Y/%m/%e %k:%i:%s'))
					 as previous1weeks,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+previous14days.getFullYear()+`/`+(previous14days.getMonth()+1)+`/`+previous14days.getDate()+` 0:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+previous7days.getFullYear()+`/`+(previous7days.getMonth()+1)+`/`+previous7days.getDate()+` 23:59:59','%Y/%m/%e %k:%i:%s'))
					 as previous2weeks,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+previous21days.getFullYear()+`/`+(previous21days.getMonth()+1)+`/`+previous21days.getDate()+` 0:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+previous14days.getFullYear()+`/`+(previous14days.getMonth()+1)+`/`+previous14days.getDate()+` 23:59:59','%Y/%m/%e %k:%i:%s'))
					 as previous3weeks,
					(select count(*) from USERACCOUNT 
						where create_datetime > STR_TO_DATE('`+previous28days.getFullYear()+`/`+(previous28days.getMonth()+1)+`/`+previous28days.getDate()+` 0:0:0','%Y/%m/%e %k:%i:%s')
							and create_datetime < STR_TO_DATE('`+previous21days.getFullYear()+`/`+(previous21days.getMonth()+1)+`/`+previous21days.getDate()+` 23:59:59','%Y/%m/%e %k:%i:%s'))
					 as previous4weeks
				from USERACCOUNT;`,(err, rows)=>{
					if(err) throw err;
					timeTheDay.push(rows[0].yesterday6clock);	timeTheDay.push(rows[0].yesterday7clock);
					timeTheDay.push(rows[0].yesterday8clock);	timeTheDay.push(rows[0].yesterday9clock);
					timeTheDay.push(rows[0].yesterday10clock);	timeTheDay.push(rows[0].yesterday11clock);
					timeTheDay.push(rows[0].yesterday12clock);	timeTheDay.push(rows[0].yesterday13clock);
					timeTheDay.push(rows[0].yesterday14clock);	timeTheDay.push(rows[0].yesterday15clock);
					timeTheDay.push(rows[0].yesterday16clock);	timeTheDay.push(rows[0].yesterday17clock);
					timeTheDay.push(rows[0].yesterday18clock);	timeTheDay.push(rows[0].yesterday19clock);
					timeTheDay.push(rows[0].yesterday20clock);	timeTheDay.push(rows[0].yesterday21clock);
					timeTheDay.push(rows[0].yesterday22clock);	timeTheDay.push(rows[0].yesterday23clock);
					timeTheDay.push(rows[0].today0clock);	timeTheDay.push(rows[0].today1clock);
					timeTheDay.push(rows[0].today2clock);	timeTheDay.push(rows[0].today3clock);
					timeTheDay.push(rows[0].today4clock);	timeTheDay.push(rows[0].today5clock);

					timeTheWeek.push(rows[0].previous7days);	timeTheWeek.push(rows[0].previous6days);
					timeTheWeek.push(rows[0].previous5days);	timeTheWeek.push(rows[0].previous4days);
					timeTheWeek.push(rows[0].previous3days);	timeTheWeek.push(rows[0].previous2days);
					timeTheWeek.push(rows[0].yesterday);
					
					timeTheMonth.push(rows[0].previous4weeks);	timeTheMonth.push(rows[0].previous3weeks);
					timeTheMonth.push(rows[0].previous2weeks);	timeTheMonth.push(rows[0].previous1weeks);
					/*for(var i=0; i<24; i++)
					{
						connection.query(`select count(*) as day_count from USERACCOUNT 
							where create_datetime > STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` `+i+`:0:0','%Y/%m/%e %k:%i:%s')
								and create_datetime < STR_TO_DATE('`+yesterday.getFullYear()+`/`+(yesterday.getMonth()+1)+`/`+yesterday.getDate()+` `+i+`:59:59','%Y/%m/%e %k:%i:%s')`, (err,rows)=>{
									if(err) throw err;

									//timeTheDay.push(rows[0].day_count);
									timeTheDay.push(i);
								});
					}
					console.log(timeTheDay);*/
					callback(err, rows);
				});
			},
			function(callback){
				// Get sync cost time
				connection.query(`(select
						count(*) as sync_cost_20,
						UA.login_platform
					from USERACCOUNT as UA
					inner join SYNC_END as SE
						on UA.account_hashkey = SE.account_hashkey
					where
						UA.login_platform = 'google'
						and SE.sync_time_state = 1
						and	(SE.ctime-UA.create_datetime) >= 0
						and (SE.ctime-UA.create_datetime) <= 20)
					union
					(select
						count(*) as sync_cost_20,
						UA.login_platform
					from USERACCOUNT as UA
					inner join SYNC_END as SE
						on UA.account_hashkey = SE.account_hashkey
					where
						UA.login_platform = 'naver'
						and SE.sync_time_state = 1
						and	(SE.ctime-UA.create_datetime) >= 0
						and (SE.ctime-UA.create_datetime) <= 20)
					union
					(select
						count(*) as sync_cost_20,
						UA.login_platform
					from USERACCOUNT as UA
					inner join SYNC_END as SE
						on UA.account_hashkey = SE.account_hashkey
					where
						UA.login_platform = 'ical'
						and SE.sync_time_state = 1
						and	(SE.ctime-UA.create_datetime) >= 0
						and (SE.ctime-UA.create_datetime) <= 20)`,(err, rows)=>{
						if(err) throw err;

						
						for(var i=0; i<rows.length; i++){
							if(rows[i].login_platform === null)
								continue;
							
							syncCost20[rows[i].login_platform]=rows[i].sync_cost_20;
						}
						
						callback(err, rows);
				});
			},
			function(callback){
				connection.query(`(select
						count(*) as sync_cost_40,
						UA.login_platform
					from USERACCOUNT as UA
					inner join SYNC_END as SE
						on UA.account_hashkey = SE.account_hashkey
					where
						UA.login_platform = 'google'
						and SE.sync_time_state = 1
						and	(SE.ctime-UA.create_datetime) > 20
						and (SE.ctime-UA.create_datetime) <= 40)
					union
					(select
						count(*) as sync_cost_40,
						UA.login_platform
					from USERACCOUNT as UA
					inner join SYNC_END as SE
						on UA.account_hashkey = SE.account_hashkey
					where
						UA.login_platform = 'naver'
						and SE.sync_time_state = 1
						and	(SE.ctime-UA.create_datetime) > 20
						and (SE.ctime-UA.create_datetime) <= 40)
					union
					(select
						count(*) as sync_cost_40,
						UA.login_platform
					from USERACCOUNT as UA
					inner join SYNC_END as SE
						on UA.account_hashkey = SE.account_hashkey
					where
						UA.login_platform = 'ical'
						and SE.sync_time_state = 1
						and	(SE.ctime-UA.create_datetime) > 20
						and (SE.ctime-UA.create_datetime) <= 40)`,(err, rows)=>{
						if(err) throw err;

						for(var i=0; i<rows.length; i++){
							if(rows[i].login_platform === null)
								continue;
							
							syncCost40[rows[i].login_platform]=rows[i].sync_cost_40;
						}
						callback(err, rows);
				});
			},
			function(callback){
				connection.query(`(select
						count(*) as sync_cost_60,
						UA.login_platform
					from USERACCOUNT as UA
					inner join SYNC_END as SE
						on UA.account_hashkey = SE.account_hashkey
					where
						UA.login_platform = 'google'
						and SE.sync_time_state = 1
						and	(SE.ctime-UA.create_datetime) > 40)
					union
					(select
						count(*) as sync_cost_60,
						UA.login_platform
					from USERACCOUNT as UA
					inner join SYNC_END as SE
						on UA.account_hashkey = SE.account_hashkey
					where
						UA.login_platform = 'naver'
						and SE.sync_time_state = 1
						and	(SE.ctime-UA.create_datetime) > 40)
					union
					(select
						count(*) as sync_cost_60,
						UA.login_platform
					from USERACCOUNT as UA
					inner join SYNC_END as SE
						on UA.account_hashkey = SE.account_hashkey
					where
						UA.login_platform = 'ical'
						and SE.sync_time_state = 1
						and	(SE.ctime-UA.create_datetime) > 40)`,(err, rows)=>{
						if(err) throw err;

						for(var i=0; i<rows.length; i++){
							if(rows[i].login_platform === null)
								continue;
							
							syncCost60[rows[i].login_platform]=rows[i].sync_cost_60;
						}
						callback(err, rows);
				});
		}], function(err, res){
			if(err) return parallel_done(err);

			var googleSyncCost=[];
			var naverSyncCost=[];
			var appleSyncCost=[];

			if(syncCost20['naver'] !== undefined)
				naverSyncCost.push(syncCost20['naver']);
			else
				naverSyncCost.push(0);
			if(syncCost40['naver'] !== undefined)
				naverSyncCost.push(syncCost40['naver']);
			else
				naverSyncCost.push(0);
			if(syncCost60['naver'] !== undefined)
				naverSyncCost.push(syncCost60['naver']);
			else
				naverSyncCost.push(0);

			if(syncCost20['google'] !== undefined)
				googleSyncCost.push(syncCost20['google']);
			else
				googleSyncCost.push(0);
			if(syncCost40['google'] !== undefined)
				googleSyncCost.push(syncCost40['google']);
			else
				googleSyncCost.push(0);
			if(syncCost60['google'] !== undefined)
				googleSyncCost.push(syncCost60['google']);
			else
				googleSyncCost.push(0);

			if(syncCost20['ical'] !== undefined)
				appleSyncCost.push(syncCost20['ical']);
			else
				appleSyncCost.push(0);
			if(syncCost40['ical'] !== undefined)
				appleSyncCost.push(syncCost40['ical']);
			else
				appleSyncCost.push(0);
			if(syncCost60['ical'] !== undefined)
				appleSyncCost.push(syncCost60['ical']);
			else
				appleSyncCost.push(0);

			result.render('index.html',{
				totalRegister : totalRegister,
				yesterdayRegister : yesterdayRegister,
				reactTimeMin : reactTimeMin,
				reactTimeSec : reactTimeSec,
				maleCount : maleCount,
				femaleCount : femaleCount,
				age10count : age10count,
				age20count : age20count,
				age30count : age30count,
				age40count : age40count,
				naverSyncCost : naverSyncCost,
				googleSyncCost : googleSyncCost,
				appleSyncCost : appleSyncCost,
				timeTheDay : timeTheDay,
				timeTheWeek : timeTheWeek,
				timeTheMonth : timeTheMonth,
				userFeedback : userFeedback,
				outUserFeedback : outUserFeedback,
				southReco : southReco,
				northReco : northReco,
				centeralReco : centeralReco,
				eastReco : eastReco,
				westReco : westReco,
				admin_name : sess.name
			});
		});	
	});

	app.get('/',(req,res)=>{
		if(sess.name)
			res.redirect('/dashboard');
		else
			res.render('./pages/examples/login.html',{error:null});
	});
	app.post('/login',(req,res)=>{
		sess = req.session;

		connection.query('select admin_name from ADMINACCOUNT where admin_id=\''+req.body.adminId+'\' and admin_pw=\''+req.body.password+'\'',(err,rows)=>{
			if(rows.length>0){
				sess.name = rows[0].admin_name;
				res.redirect('/dashboard');
			}
			else{
				res.render('./pages/examples/login.html',{error: "Input wrong id or password"});
			}
		});
	});
	app.get('/logout',(req,res)=>{
		sess = req.session;

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
	});
	app.get('/pages/charts/chartjs.html',function(req,res){
		res.render('pages/charts/chartjs.html');
    });
}