const mysql = require('mysql');
var dbconfig = require(__dirname+'/../config/db-config.json');
var connection = mysql.createConnection(dbconfig);

/**
 * TODO 조회값 추가
 * Post retrieve
 * @param team_idx
 */
exports.getPushUsers  = () => {
    return new Promise((resolve, reject) => {              
        connection.query(
          `SELECT user_id,account_hashkey,date_format(create_datetime, '%b %d %Y %h:%i %p') as create_datetime,is_active 
          FROM USERACCOUNT
          WHERE is_active is not null`
          ,(err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
    });  
}
