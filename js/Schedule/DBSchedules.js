import { openDatabase } from 'react-native-sqlite-storage';
import Axios from 'axios';
import { baseUrl } from '../Commons/Constants';
var db = openDatabase({ name: 'Coordinates.db', createFromLocation: '~/Coordinates.db', location: 'Library' }, (open) => { console.log("asdasd", open) }, (e) => { console.log(e) });

export function creatScheduleTable() {
    let query = `CREATE TABLE IF NOT EXISTS tbl_schedule(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            latitude REAL, 
            longtitude REAL,
            taskid INTEGER,
            date TEXT,
            time TEXT,
            isSynced INTEGER,
            user_id INTEGER);`;

    db.transaction(function (txn) {
        txn.executeSql(
            query,
            [],
            function (tx, res) {
                console.log('schedule table creation', res);
            }
        );
    });
}


export function test() {
    db.transaction(function (txn) {
        txn.executeSql(
            `insert into tbl_schedule(latitude,longtitude,taskid,date,time,isSynced,user_id) 
            values(24.893148,67.066502,7,'2019-04-26','09:34:44',0,25),
            (24.948862,67.073349,9,'2019-04-26','19:54:23',0,25)`,
            [],
            function (tx, res) {
                console.log('result', res);
            }
        );
    });
}

export function test2() {
    db.transaction(function (txn) {
        txn.executeSql(
            `select * from tbl_schedule`,
            [],
            function (tx, res) {
                console.log('result', res.rows.raw());
            }
        );
    });
}


export function saveBulkTask() {
    db.transaction(function (txn) {
        txn.executeSql(
            `select * from tbl_schedule`,
            [],
            function (tx, res) {
                let tasks = res.rows.raw()
                if(tasks.length > 0){
                    let obj = {
                        data: tasks
                    }
                    Axios.post(baseUrl + `task/saveBulkTask`,obj)
                    .then(response => {
                        if(response.data.code == 200){
                            db.executeSql(
                                `delete from tbl_schedule`,
                                [],
                                function (tx, res) {
                                    console.log('task deleted after sync with server');
                                }
                            )
                        }
                    })
                    .catch(error => {
                        console.log(error)
                        // reject({
                        //     'message': 'network error',
                        //     'err': error,
                        //     "code": 500
                        // })
                    })
                }
            }
        );
    });
}

export function DBMarkComplete(userid, taskid, time, date, latitude, longitude){
    return new Promise((resolve, reject) => {
        db.transaction((txn) => {
            txn.executeSql(
                `insert into tbl_schedule(latitude,longtitude,taskid,date,time,user_id,isSynced) 
                  values(${latitude},${longitude},'${taskid}','${date}','${time}',${userid},0)`,
                [],
                (tx, res) => {
                    if (res.rowsAffected == 1) {
                        resolve({ data: res.rowsAffected, id: res.insertId, errorMessage: '' })
                    } else {
                        reject({ data: res.rowsAffected, errorMessage: 'Unable to save tracking.' })
                    }
                }
            );
        })
    })
}