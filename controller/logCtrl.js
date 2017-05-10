

exports.initData = async (req, res, next) => {
	
	console.log('[analysisCtrl]pushCtrl init Data')
	const sess = req.session;

	return res.render('analysis.html',{

		admin_name:sess.name,
		noti_data:'noti_data',
        moment: 'moment'
	})
	
};

