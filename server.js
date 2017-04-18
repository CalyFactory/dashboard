var express = require('express');


const app = express();
const port = 3333;
var router = require('./router/main')(app);
 
//app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.json());

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
 
var server = app.listen(port, function(){
    console.log("Express server has started on port 3333")
});

app.use(express.static('public'));