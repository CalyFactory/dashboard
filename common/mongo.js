var mongoose = require('mongoose');
var dbconfig = require(__dirname+'/../config/db-config.json');
mongoose.connect('mongodb://'+dbconfig["mongoUser"]+':' + dbconfig["mongoPw"] + '@127.0.0.1/calydb?authSource=admin');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('mono open')
});

exports._ = mongoose

