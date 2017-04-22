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
	app.get('/',(req,res)=>{
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

		// Get total_register count
		connection.query(`select count(*) as total_user_count from USER as U
			inner join USERACCOUNT as UA
				on U.user_hashkey = UA.user_hashkey
			where user_id != 'None'`,(err, rows)=>{
					if(err) throw err;

			totalRegister = rows[0].total_user_count;
		});
		

		// Get yesterday_register count
		connection.query(`select count(*) as yesterday_user_count from USER as U
			inner join USERACCOUNT as UA
				on U.user_hashkey = UA.user_hashkey
			where user_id != 'None'
				and UA.create_datetime > STR_TO_DATE('`+yesterday.getFullYear()+'/'+(yesterday.getMonth()+1)+'/'+yesterday.getDate()+` 0:0:0','%Y/%m/%e %k:%i:%s') 
				and UA.create_datetime < STR_TO_DATE('`+yesterday.getFullYear()+'/'+(yesterday.getMonth()+1)+'/'+yesterday.getDate()+` 23:59:59','%Y/%m/%e %k:%i:%s')`,(err, rows)=>{
			if(err) throw err;

			yesterdayRegister = rows[0].yesterday_user_count;
		});

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
		});

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
			/*
			for(var i=0; i<rows.length; i++){
				console.log(i+", "+rows[i].user_id+" : "+rows[i].contents+" /"+rows[i].created);
			}*/
		});		

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

			//console.log("gender, male count : "+maleCount+", female count : "+femaleCount);
			//console.log("=====");
			//console.log("age");
			//console.log(" 10 : "+age10count+", 20 : "+age20count+", 30 : "+age30count+", 40 : "+age40count);
		});
		
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

		});

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
			//console.log(timeTheDay);

			timeTheWeek.push(rows[0].previous7days);	timeTheWeek.push(rows[0].previous6days);
			timeTheWeek.push(rows[0].previous5days);	timeTheWeek.push(rows[0].previous4days);
			timeTheWeek.push(rows[0].previous3days);	timeTheWeek.push(rows[0].previous2days);
			timeTheWeek.push(rows[0].yesterday);
			//console.log(timeTheWeek);

			timeTheMonth.push(rows[0].previous4weeks);	timeTheMonth.push(rows[0].previous3weeks);
			timeTheMonth.push(rows[0].previous2weeks);	timeTheMonth.push(rows[0].previous1weeks);
			//console.log(timeTheMonth);
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
			
		});
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

				console.log('sync_cost_20');
				for(var i=0; i<rows.length; i++){
					if(rows[i].login_platform === null)
						continue;
					
					syncCost20[rows[i].login_platform]=rows[i].sync_cost_20;
				}
				//console.log(syncCost20);
		});

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

				console.log('sync_cost_40');
				for(var i=0; i<rows.length; i++){
					if(rows[i].login_platform === null)
						continue;
					
					syncCost40[rows[i].login_platform]=rows[i].sync_cost_40;
				}
				//console.log(syncCost40);
		});

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

				console.log('sync_cost_60');
				for(var i=0; i<rows.length; i++){
					if(rows[i].login_platform === null)
						continue;
					
					syncCost60[rows[i].login_platform]=rows[i].sync_cost_60;
				}
				//console.log(syncCost60);
				/*for(var i=0; i<rows.length; i++)
				{
					console.log(syncCost60[rows[i].login_platform]);
				} print undefined */
		});

		res.render('index.html',{
			totalRegister : totalRegister,
			yesterdayRegister : yesterdayRegister,
			reactTimeMin : reactTimeMin,
			reactTimeSec : reactTimeSec,
			maleCount : maleCount,
			femaleCount : femaleCount,
			age10count : age10count,
			age20count : age20count,
			age30count : age30count,
			age40count : age40count
		});
	});
	app.get('/pages/charts/chartjs.html',function(req,res){
		res.render('pages/charts/chartjs.html');
    });
}