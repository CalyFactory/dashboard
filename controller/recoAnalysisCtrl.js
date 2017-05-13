const mysql = require('mysql');
var async = require('async');
var dbconfig = require(__dirname+'/../config/db-config.json');
var connection = mysql.createConnection(dbconfig);

exports.renderRecoAnalysis = ( req, res, next ) => {
	const sess = req.session;
	if(!sess.name){
		res.redirect('/');
		return;
	}

	var mainRegionDict=[];
	var detailRegionDict={};
	var noneRecommendList=[];

	// Need to paging
	async.parallel([
		function(callback){
			function DisplayDT(a){
				if(a<10)
					a = '0'+a;

				return a;
			};
			connection.query(
				`select
					U.user_gender,
					U.user_birth,
					E.summary,
					E.start_dt,
					E.end_dt,
					E.location
				from EVENT as E
				inner join CALENDAR as C
					on E.calendar_hashkey = C.calendar_hashkey
				inner join USERACCOUNT as UA
					on C.account_hashkey = UA.account_hashkey
				inner join USER as U
					on UA.user_hashkey = U.user_hashkey
				where
					E.reco_state = 2`,(err,rows)=>{
				if(err) throw err;
				
				noneRecommendList=rows;
				var length = rows.length;
				//console.log(new Date(rows[i].start_dt).format(""))
				for(var i=0; i<length; i++){
					var age='알수 없음';
					var gap=new Date().getFullYear() - parseInt(noneRecommendList[i].user_birth);
					if(gap > 0 && gap < 100)
						age=gap;

					var sDate = new Date(rows[i].start_dt);
					noneRecommendList[i].converted_start_dt = sDate.getFullYear().toString().substring(2,4)+DisplayDT(sDate.getMonth()+1)+DisplayDT(sDate.getDate())+' '+DisplayDT(sDate.getHours())+':'+DisplayDT(sDate.getMinutes());//+':'+DisplayDT(sDate.getSeconds());
					//console.log(sDate.getFullYear()+'/'+(sDate.getMonth()+1)+'/'+sDate.getDate()+' '+sDate.getHours()+':'+sDate.getMinutes()+':'+sDate.getSeconds());
					//console.log(noneRecommendList.converted_start_dt);
					var eDate = new Date(rows[i].end_dt);
					var eDateTime = (eDate.getFullYear().toString().substring(2,4)+DisplayDT(eDate.getMonth()+1)+DisplayDT(eDate.getDate())) == (sDate.getFullYear().toString().substring(2,4)+DisplayDT(sDate.getMonth()+1)+DisplayDT(sDate.getDate())) ? '': eDate.getFullYear().toString().substring(2,4)+DisplayDT(eDate.getMonth()+1)+DisplayDT(eDate.getDate());
					noneRecommendList[i].converted_end_dt = eDateTime+' '+DisplayDT(eDate.getHours())+':'+DisplayDT(eDate.getMinutes());//+':'+DisplayDT(eDate.getSeconds());
					noneRecommendList[i].age = age;
				}
				callback(err, noneRecommendList);
			});				
		},
		function(callback){
			connection.query(
				`select
					R.main_region,
					R.region,
					(select sum(RECO.reco_cnt) from RECOMMENDATION as RECO where RECO.main_region = R.main_region) as main_region_recommends,
					(select sum(RECO.reco_cnt) from RECOMMENDATION as RECO where RECO.region = R.region) as detail_region_recommends
				from RECOMMENDATION as R
				where
					R.main_region != 'NULL'
					or R.main_region != 'None'
				group by R.main_region, R.region, main_region_recommends`,(err, rows)=>{
				if(err) throw err;
				//var totalMainRegionCounts=0;
				//for(var i=0; i<rows.length; i++)
				//	totalMainRegionCounts += rows[i].main_region_recommends;
				var mainRegionTempDict ={};
				for(var i=0; i<rows.length; i++){
					if(mainRegionTempDict[rows[i].main_region] == null)
						mainRegionTempDict[rows[i].main_region] = rows[i].main_region_recommends;
					
					detailRegionDict[i]={
						'main_region' : rows[i].main_region, 
						'region'	  : rows[i].region, 
						'detail_count': rows[i].detail_region_recommends, 
						'detail_percent': Math.floor(rows[i].detail_region_recommends/rows[i].main_region_recommends*100)
					};
				}
				for(var i=0; i<Object.keys(mainRegionTempDict).length ; i++){
					mainRegionDict.push({
						'label' : Object.keys(mainRegionTempDict)[i],
						'value': Object.values(mainRegionTempDict)[i]
					});
				}
				callback(err, rows);
			});
			
	}], function(err, ressult){
		res.render('simple.html',{
			admin_name 			 : sess.name,
			mainRegionDict : mainRegionDict,
			detailRegionDict : detailRegionDict,
			noneRecommendList 	 : noneRecommendList
		});
	}); // end async.parallel
}