const logAnalysisModel = require(__dirname+'/../model/logAnalysisModel.js');

// const logAnalysisModel2 = require(__dirname+'/../model/logAnalysisModel2.js');

const __ = require(__dirname+'/../common/statics.js');
///
/// MONGODB TEST QUERY
// db.getCollection('reco_log').find({$and:[
//                         {category:'recoView'},
// 			{label:'fullMap'}, 
// 			{residenseTime:'0'}
// ]}).sort({cTime:-1})

// MONGODB EVENT GROUP TEST QUERY 
// var map = function() {
//      emit(this.eventHashkey,  1 );
// }
// var reduce = function(session, values) {
//      var total = 0;
//      values.forEach(function(value){
//           total += value;
//      });
//      return  total ;
// }

// db.getCollection('reco_log').mapReduce(
// map,
// reduce,
// {
//     query:{
//             $and:[
//                     {category:"recoCell"},
//                     {label:"deepLink"},
//                     {residenseTime:"0"},
//                     {eventHashkey:{$exists:true}}
//                 ]
//         },
//        out:"tmpRecoViewCell"
// }
// )
// db.tmpRecoViewCell.find();
exports.initData = async (req, res, next) => {
	
	console.log('[log]pushCtrl init Data')
	const sess = req.session;

	//////////////////////
	/////#0
	var queryy = {
		$and:[
			{category:__.EVENT_CELL},
			{label:__.CELL}
		]
	}
	eventViewCellList = await getSessionGroupCnt('event_log',queryy);
	eventViewCellAvg = getListToAvg(eventViewCellList)
	//세션별 이벤트셀 클릭ㄹ평균
	console.log("세션별 이벤트셀 클릭평균 => ",eventViewCellAvg)


	//////////////////////
	/////#1
	var queryy = {
            $and:[
                    {label:"questionMark"}
			]
	}	
	eventViewQuestionAccountGroupList =  await getScreenAccountHahshkeyGroupCnt('event_log',queryy)


	var queryy = {
            $and:[
                    {label:"analyzing"}
			]
	}	
	eventViewAnalyzingAccountGroupList =  await getScreenAccountHahshkeyGroupCnt('event_log',queryy)	
	//실제 scrennviewList

	var queryy = {
            $and:[
                    {screenName:"io.caly.calyandroid.activity.EventListActivity"}
                ]
	}	
	eventScreenEventViewAccountGroupList =  await getScreenAccountHahshkeyGroupCnt('screen_log',queryy)
	//실제 scrennviewList
	questionMarkClickRate = eventViewQuestionAccountGroupList.length/eventScreenEventViewAccountGroupList.length
	console.log('accountHash 별 eventlist 뷰 갯수에의한  Questionmark 클릭 률 =>',questionMarkClickRate )
	analyzingClickRate = eventViewAnalyzingAccountGroupList.length/eventScreenEventViewAccountGroupList.length
	console.log('accountHash 별 eventlist 뷰 갯수에의한  Analyzing 클릭 률 =>',analyzingClickRate )



	
	//#3 이벤트해시키별 recoCell/deeplink
	// var queryy = "{$and:[{category:'"+__.RECO_CELL+"'},{label:'"+__.DEEPLINK+"'}, {residenseTime:'0'},{eventHashkey:{$exists:true}}]}"

	//////////////////////
	/////#3
	await logAnalysisModel.eventLog.find(
	{$and:[
			{category:"eventView"},
			{label:"refreshEventList"}
		]},{label:1} 
	, function (err, rows) {
	  if (err) return handleError(err);	  
	  refreshCnt = rows.length
	  console.log('리프레시 버튼 클릭 횟수 => ', rows.length)
	})


	var queryy = {
            $and:[
                    {label:"banner"}
			]
	}	
	eventViewBannerAccountGroupList =  await getScreenAccountHahshkeyGroupCnt('event_log',queryy)


	var queryy = {
            $and:[
                    {label:"bannerShowing"}
			]
	}	
	eventViewBannerShowingAccountGroupList =  await getScreenAccountHahshkeyGroupCnt('event_log',queryy)		
	bannerCloseRate = eventViewBannerAccountGroupList.length/eventViewBannerShowingAccountGroupList.length
	console.log('account별 배너 보여진 갯수 당 배너 클릭률=> ', bannerCloseRate)


	//////////////////////
	/////#5	
	var queryy = {
		$and:[
			{category:__.RECO_CELL},
			{label:__.DEEPLINK}, 
			{residenseTime:'0'},
			{eventHashkey:{$exists:true}}
		]
	}
	recoViewDeepLinkList = await getRecoEventHashGroupCnt(queryy);
	recoViewDeepLinkAvg = getListToAvg(recoViewDeepLinkList)
	//이벤트별 depplink 클릭 
	console.log("이벤트별 추천리스트에서 DeepLink클릭 평균 => ",recoViewDeepLinkAvg)



	//////////////////////
	/////#6
	await logAnalysisModel.recoResidenseLog.find(
		{
			$and:[
			{residenseTime:{$ne:"0"}},
			{label:"deepLink"}
			]
		}
		,{residenseTime:1} 
	, function (err, rows) {
	  	if (err) return handleError(err);	  
	  	
	  	var totalCnt = 0 ;
		rows.forEach(function(row){
			
			residenseTime = row.residenseTime * 1
			totalCnt += residenseTime
			
		});
		recoResidenseLogAvg = (totalCnt/rows.length)/1000
	  	console.log('블로그 유지시간평균 => ',recoResidenseLogAvg)
	})


	//////////////////////
	/////#7	
	var queryy = {
		$and:[
                {category:'recoCell'},
                {label:'itemMap'},                    
                {eventHashkey:{$exists:true}}
		]
	}
	recoViewItemMapList = await getRecoEventHashGroupCnt(queryy);
	recoViewItemMapAvg = getListToAvg(recoViewItemMapList)
	console.log("이벤트별 itemMap클릭 평균 => ",recoViewItemMapAvg)

	//////////////////////
	/////#8
	var queryy = {
		$and:[
            {category:'recoCell'},                    
            {$or:[{label:'sharingKakaoInCell'}]},                    
            {eventHashkey:{$exists:true}}	
        ]
	}
	recoViewKaKaoSharingList = await getRecoEventHashGroupCnt(queryy);
	recoViewKaKaoSharingAvg = getListToAvg(recoViewKaKaoSharingList)
	//이벤트별 depplink 클릭 
	console.log("이벤트별 추천리스트에서 카카오 공유 클릭 평균 => ",recoViewKaKaoSharingAvg)
	


	//////////////////////
	////#9.0
	var queryy = {
		$and:[
                {category:'recoView'},                
                {label:'fullMap'},                                    
                {eventHashkey:{$exists:true}}
        ]
	}
	recoViewFullMapList = await getRecoEventHashGroupCnt(queryy);
	recoViewFullMapListAvg = getListToAvg(recoViewFullMapList)
	//이벤트별 depplink 클릭 릭
	console.log("이벤트별 추천리스트에서 추천 지도로 넘어가는 클릭 평균 => ",recoViewFullMapListAvg)	
	
	
	//////////////////////
	////#10.0 - restaurant
	var queryy = {
		$and:[
                {category:'recoView'},                
                {label:'restaurant'},                                    
                {sessionKey:{$exists:true}}
        ]
	}
	recoViewTapRestaurantList = await getSessionGroupCnt('reco_log',queryy);
	recoViewTapRestaurantAvg = getListToAvg(recoViewTapRestaurantList)
	//이벤트별 depplink 클릭 릭
	console.log("세션별 추천리스트에서 restaurant 카테고리 클릭률 => ",recoViewTapRestaurantAvg)	

	//////////////////////
	////#10.1 - cafe
	var queryy = {
		$and:[
                {category:'recoView'},                
                {label:'cafe'},                                    
                {sessionKey:{$exists:true}}
        ]
	}
	recoViewTapCafeList = await getSessionGroupCnt('reco_log',queryy);
	recoViewTapCafeAvg = getListToAvg(recoViewTapCafeList)
	//이벤트별 depplink 클릭 릭
	console.log("세션별 추천리스트에서 cafe 카테고리 클릭률 => ",recoViewTapCafeAvg)

	//////////////////////
	////#10.2 - cafe
	var queryy = {
		$and:[
                {category:'recoView'},                
                {label:'place'},                                    
                {sessionKey:{$exists:true}}
        ]
	}
	recoViewTapPlaceList = await getSessionGroupCnt('reco_log',queryy);
	recoViewTapPlaceAvg = getListToAvg(recoViewTapPlaceList)
	//이벤트별 depplink 클릭 릭
	console.log("세션별 추천리스트에서 place 카테고리 클릭률 => ",recoViewTapPlaceAvg)			



	/////////////////////////
	////////지   도 //////////
	////////////////////////

	//////////////////////
	/////#11
	var queryy = {
		$and:[
			{category:'recoMapCell'},
			{label:'deepLink'}, 
			{residenseTime:'0'},
			{eventHashkey:{$exists:true}}
		]
	}
	recoMapCellDeepLinkList = await getRecoEventHashGroupCnt(queryy);
	recoMapCellDeepLinkAvg = getListToAvg(recoMapCellDeepLinkList)
	//이벤트별 depplink 클릭 
	console.log("이벤트별 지도뷰에서 DeepLink클릭 평균 => ",recoMapCellDeepLinkAvg)


	//////////////////////
	////#12
	var queryy = {
		$and:[
            {category:'recoMapCell'},                    
            {$or:[{label:'sharingKakaoInCell'}]},                    
            {eventHashkey:{$exists:true}}	
        ]
	}
	recoMapViewKaKaoSharingList = await getRecoEventHashGroupCnt(queryy);
	recoMapViewKaKaoSharingAvg = getListToAvg(recoMapViewKaKaoSharingList)
	//이벤트별 depplink 클릭 
	console.log("이벤트별 추천지도에서 카카오 공유 클릭 평균 => ",recoMapViewKaKaoSharingAvg)	


	//////////////////////
	////#13.0
	var queryy = {
		$and:[
                {category:'recoMapView'},                
                {label:'filterAll'},                                    
                {sessionKey:{$exists:true}}
        ]
	}
	recoMapViewFilterAllList = await getSessionGroupCnt('reco_log',queryy);
	recoMapViewFilterAllAvg = getListToAvg(recoMapViewFilterAllList)
	
	console.log("세션별 추천지도에서 전체보기 카테고리 클릭률 => ",recoMapViewFilterAllAvg)	

	//////////////////////
	////#13.1
	var queryy = {
		$and:[
                {category:'recoMapView'},                
                {label:'filterRestaurant'},                                    
                {sessionKey:{$exists:true}}
        ]
	}
	recoMapViewFilterRestaurantList = await getSessionGroupCnt('reco_log',queryy);
	recoMapViewFilterRestaurantAvg = getListToAvg(recoMapViewFilterRestaurantList)
	
	console.log("세션별 추천리스트에서 restaurant 카테고리 클릭률 => ",recoMapViewFilterRestaurantAvg)		

	//////////////////////
	////#13.2
	var queryy = {
		$and:[
                {category:'recoMapView'},                
                {label:'filterCafe'},                                    
                {sessionKey:{$exists:true}}
        ]
	}
	recoMapViewFilterCafeList = await getSessionGroupCnt('reco_log',queryy);
	recoMapViewFilterCafeAvg = getListToAvg(recoMapViewFilterCafeList)
	
	console.log("세션별 추천지도에서 cafe 카테고리 클릭률 => ",recoMapViewFilterCafeAvg)		

	//////////////////////
	////#13.2
	var queryy = {
		$and:[
                {category:'recoMapView'},                
                {label:'filterPlace'},                                    
                {sessionKey:{$exists:true}}
        ]
	}
	recoMapViewFilterPlaceList = await getSessionGroupCnt('reco_log',queryy);
	recoMapViewFilterPlaceAvg = getListToAvg(recoMapViewFilterPlaceList)
	
	console.log("세션별 추천지도에서 place 카테고리 클릭률 => ",recoMapViewFilterPlaceAvg)		




	//////////////////////
	////#14

	await logAnalysisModel.recoResidenseLog.find(
		{
			$and:[
			{residenseTime:{$ne:"0"}},
			{label:"fullMap"}
			]
		}
		,{residenseTime:1} 
	, function (err, rows) {
	  	if (err) return handleError(err);	  
	  	
	  	var totalCnt = 0 ;
		rows.forEach(function(row){
			
			residenseTime = row.residenseTime * 1
			totalCnt += residenseTime
			
		});
		recoResidenseLogAvg = (totalCnt/rows.length)/1000
	
	})
	console.log('지도화면에서 머물렀던 시간 평균 => ',recoResidenseLogAvg)

	//////////////////////
	////#15
	var recoMapViewMyLocationAvg = 0
	var recoViewGoFullMapCnt = 0 ;
	var recoMapViewMyLocationCnt = 0 ;
	
	recoViewGoFullMapCnt = await getRecoViewGoFullMapCnt();
	recoMapViewMyLocationCnt = await getRecoMapViewMyLocationCnt();
	////////////////////
	////#15

	recoMapViewMyLocationAvg  = recoMapViewMyLocationCnt/recoViewGoFullMapCnt;

	console.log('추천지도로가기 클릭중 myLocation 클릭 비율 => ',recoMapViewMyLocationAvg)





	return res.render('log.html',{

		admin_name:sess.name,
		eventData:{
					eventViewCellAvg:eventViewCellAvg.toFixed(2),
					analyzingClickRate:analyzingClickRate.toFixed(2),
					questionMarkClickRate:questionMarkClickRate.toFixed(2),
					refreshCnt:refreshCnt,
					bannerCloseRate:bannerCloseRate.toFixed(2)
		},
		recoListData:{
				recoViewDeepLinkAvg:recoViewDeepLinkAvg.toFixed(2),
				recoResidenseLogAvg:recoResidenseLogAvg.toFixed(2),
				recoViewItemMapAvg:recoViewItemMapAvg.toFixed(2),
				recoViewKaKaoSharingAvg:recoViewKaKaoSharingAvg.toFixed(2),
				recoViewFullMapListAvg:recoViewFullMapListAvg.toFixed(2),
				recoViewTapRestaurantAvg:recoViewTapRestaurantAvg.toFixed(2),
				recoViewTapCafeAvg:recoViewTapCafeAvg.toFixed(2),
				recoViewTapPlaceAvg:recoViewTapPlaceAvg.toFixed(2)
		},
		recoMapData:{
			recoMapCellDeepLinkAvg:recoMapCellDeepLinkAvg.toFixed(2),
			recoMapViewKaKaoSharingAvg:recoMapViewKaKaoSharingAvg.toFixed(2),
			recoMapViewFilterAllAvg:recoMapViewFilterAllAvg.toFixed(2),
			recoMapViewFilterRestaurantAvg:recoMapViewFilterRestaurantAvg.toFixed(2),
			recoMapViewFilterCafeAvg:recoMapViewFilterCafeAvg.toFixed(2),
			recoResidenseLogAvg:recoResidenseLogAvg.toFixed(2),
			recoMapViewMyLocationAvg:recoMapViewMyLocationAvg.toFixed(2)
		},
        moment: 'moment'
	})
	
};

async function getRecoMapViewMyLocationCnt(){
	return new Promise((resolve, reject) => {
		logAnalysisModel.justRecoCntLog.find(
			{
				$and:[
	                    {category:'recoMapView'},
						{label:'myLocation'}, 
						{residenseTime:'0'}
				]
			}
		, function (err, rows) {
			if (err) reject(err);					
		  	resolve(rows.length)
		})	
	});
}

async function getRecoViewGoFullMapCnt(){
	return new Promise((resolve, reject) => {
		logAnalysisModel.justRecoCntLog.find(
			{
				$and:[
	                    {category:'recoView'},
						{label:'fullMap'}, 
						{residenseTime:'0'}
				]
			}
		, function (err, rows) {
		  	if (err) reject(err);	  
		  	resolve(rows.length)
		})	
	});
}

function getListToAvg(eventViewCell) {
	var totalCnt = 0 ;
	eventViewCell.forEach(function(session){
		totalCnt += session.value
	});
	return totalCnt/eventViewCell.length

}

async function getSessionGroupCnt(collectionName,queryy) {
	return new Promise((resolve, reject) => {            

		var outCollection = ''

		if (collectionName == 'event_log'){
			outCollection = "tmpEventViewCell"
		}else{
			outCollection = "tmpRecoViewCell"
		}

        var map = function() {
             emit(this.sessionKey,  1 );
        }
        var reduce = function(session, values) {
             var total = 0;
             values.forEach(function(value){
                  total += value;
             });
             return  total ;
        }
        var command = {
            mapreduce: collectionName,
            map:map.toString(),
            reduce: reduce.toString(),
            query: queryy,
            out: outCollection
        }	
        // command.resolveToObject = true;
        // var promise = logAnalysisModel.tmpEventViewCell.mapReduce(command);
        // promise.then(function (res){
        // 	var model = res.model;
        // 	var stats = res.stats;

        // 	return model.find();
        // }).then(function (docs){
        // 	resovle(docs)
        // })

		
		logAnalysisModel.sessionGroupCntLog.mapReduce(command, function (err, model, stats) {
			if (err) throw reject(err);
			// console.log('map reduce took %d ms', stats.processtime)
			model.find().exec(function (err, docs) {
				// console.log(docs)
				resolve(docs)
			});
		})        

	});
}

async function getRecoEventHashGroupCnt(queryy) {

	return new Promise((resolve, reject) => {            
        var map = function() {
             emit(this.eventHashkey,  1 );
        }
        var reduce = function(session, values) {
             var total = 0;
             values.forEach(function(value){
                  total += value;
             });
             return  total ;
        }
        var command = {
            mapreduce: "reco_log",
            map:map.toString(),
            reduce: reduce.toString(),
            query: queryy,
            out: "tmpRecoViewCell"
        }	
        // command.resolveToObject = true;
        // var promise = logAnalysisModel.tmpEventViewCell.mapReduce(command);
        // promise.then(function (res){
        // 	var model = res.model;
        // 	var stats = res.stats;

        // 	return model.find();
        // }).then(function (docs){
        // 	resovle(docs)
        // })

		
		logAnalysisModel.eventHashGroupCntLog.mapReduce(command, function (err, model, stats) {
			if (err) throw reject(err);
			// console.log('map reduce took %d ms', stats.processtime)
			model.find().exec(function (err, docs) {
				// console.log(docs)
				resolve(docs)
			});
		})        

	});
}

async function getScreenAccountHahshkeyGroupCnt(collectionName,queryy) {

	return new Promise((resolve, reject) => {            
        var map = function() {
             emit(this.accountHashkey,  1 );
        }
        var reduce = function(session, values) {
             var total = 0;
             values.forEach(function(value){
                  total += value;
             });
             return  total ;
        }
        var command = {
            mapreduce: collectionName,
            map:map.toString(),
            reduce: reduce.toString(),
            query: queryy,
            out: "tmpScreenViewLog"
        }	
        // command.resolveToObject = true;
        // var promise = logAnalysisModel.tmpEventViewCell.mapReduce(command);
        // promise.then(function (res){
        // 	var model = res.model;
        // 	var stats = res.stats;

        // 	return model.find();
        // }).then(function (docs){
        // 	resovle(docs)
        // })

		
		logAnalysisModel.eventHashGroupCntLog.mapReduce(command, function (err, model, stats) {
			if (err) throw reject(err);
			// console.log('map reduce took %d ms', stats.processtime)
			model.find().exec(function (err, docs) {
				// console.log(docs)
				resolve(docs)
			});
		})        

	});
}



async function getSessionGroupAllCnt() {
	return new Promise((resolve, reject) => {            		
		logAnalysisModel.sessionGroupAllCntLog.aggregate(
		 { $group : { _id : "$sessionKey" } } 
		, function (err, doc) {
			if (err) throw reject(err);
			
		    resolve(doc)		  
		});        

	});
}