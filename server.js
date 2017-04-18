import mysql from 'mysql';
import express from 'express';

let dbconfig = require(__dirname+'/config/db-config.json');
let connection = mysql.createConnection(dbconfig);

const app = express();
const port = 3333;
var router = require('./router/main')(app);
 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
 
var server = app.listen(3333, function(){
    console.log("Express server has started on port 3000")
});

app.use(express.static('public'));