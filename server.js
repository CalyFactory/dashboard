var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');

const app = express();
const port = 3333;

 //app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.json());

app.use(session({
	secret: '#a87c08z89c8c9cv8dytu',
	resave: false,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var router = require('./router/main')(app);

var server = app.listen(port, function(){
    console.log("Express server has started on port 3333")
});

app.use(express.static('public'));