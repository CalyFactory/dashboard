const mysql = require('mysql');
var dbconfig = require(__dirname+'/../config/db-config.json');
var connection = mysql.createConnection(dbconfig);

/**
 * TODO 조회값 추가
 * Post retrieve
 * @param team_idx
 */
exports.getUserAccount  = (adminName) => {
    return new Promise((resolve, reject) => {              
        connection.query(
          `SELECT account_hashkey FROM ADMINACCOUNT WHERE admin_name = ?`
          ,adminName,(err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
    });  
}
