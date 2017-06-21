const mysql = require('mysql');
var dbconfig = require(__dirname+'/../config/db-config.json');
var connection = mysql.createConnection(dbconfig);

/**
 * TODO 조회값 추가
 * Post retrieve
 * @param team_idx
 */
exports.getNoti  = () => {
    return new Promise((resolve, reject) => {            

        connection.query(
            ` SELECT NOTICE.create_datetime,NOTICE.notice_title,NOTICE.notice_description,ADMINACCOUNT.admin_name as register FROM NOTICE 
            INNER JOIN ADMINACCOUNT on NOTICE.register = ADMINACCOUNT.account_hashkey 
            ORDER BY NOTICE.create_datetime desc`
        , (err, rows) => {
            if (err) {
            reject(err);
            } else {
            resolve(rows);
            }
        });
    });  
}

exports.setNoti = (title,contents,accountHashkey) => {
     return new Promise((resolve, reject) => {            

        connection.query(
            `INSERT INTO NOTICE (notice_title,notice_description,register) VALUES(?,?,?) `
        ,[title,contents,accountHashkey], (err, rows) => {
            if (err) {
            reject(err);
            } else {
            resolve(rows);
            }
        });
    });     
}