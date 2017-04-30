const mysql = require('mysql');
var dbconfig = require(__dirname+'/../config/db-config.json');
var connection = mysql.createConnection(dbconfig);

/**
 * TODO 조회값 추가
 * Post retrieve
 * @param team_idx
 */
exports.getPushToken  = (userIds) => {
    return new Promise((resolve, reject) => {              
          var additionalUsers = ''
          for (i = 0; i < userIds.length; i++) { 
              additionalUsers += 'USERACCOUNT.user_id = "'+ userIds[i] + '" or '              
          }
          additionalUsers = additionalUsers.substring(0, additionalUsers.length - 3);

        connection.query(
          `SELECT push_token FROM USERDEVICE
          INNER JOIN USERACCOUNT
          ON USERACCOUNT.account_hashkey = USERDEVICE.account_hashkey
          WHERE USERACCOUNT.is_active IS NOT NULL 
          AND `+ additionalUsers
          , (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
    });  
}
