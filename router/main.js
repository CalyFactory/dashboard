module.exports = function(app)
{
     app.get('/',function(req,res){
        res.render('index.html')
     });
     app.get('/pages/charts/chartjs.html',function(req,res){
        res.render('pages/charts/chartjs.html');
    });
}