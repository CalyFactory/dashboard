const mysql = require('mysql');
var dbconfig = require(__dirname+'/../config/db-config.json');
var connection = mysql.createConnection(dbconfig);

/**
 * TODO 조회값 추가
 * Post retrieve
 * @param team_idx
 */
exports.getPushToken  = (users) => {
    return new Promise((resolve, reject) => {            
        console.log('users' ,users)  
        var additionalUsers = ''
        for (i = 0; i < users.length; i++) { 
            additionalUsers += 'USERACCOUNT.user_id = "'+ users[i]['userId'] + '" AND ' + ' USERACCOUNT.login_platform =  "' + users[i]['loginPlatform'] +'" OR '           
        }
        additionalUsers = additionalUsers.substring(0, additionalUsers.length - 3);
        console.log(additionalUsers)
        connection.query(
            `SELECT push_token,user_id,login_platform FROM USERDEVICE
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
