import { openDatabase } from 'react-native-sqlite-storage';
import moment from "moment"

var db = openDatabase({ name: 'Coordinates.db', createFromLocation: '~/Coordinates.db', location: 'Library' }, (open) => { console.log("asdasd", open) }, (e) => { console.log(e) });


export function creatAttendaneTable() {
    let query = `CREATE TABLE IF NOT EXISTS tbl_attendance(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            latitude REAL, 
            longtitude REAL,
            type TEXT,
            date TEXT,
            time TEXT,
            user_id INTEGER);`;

    db.transaction(function (txn) {
        txn.executeSql(
            query,
            [],
            function (tx, res) {
                console.log('Attendance table creation', res);
            }
        );
    });
}


export function DBMarkAttendance(user,date,time,type,latitude,longitude) {
    return new Promise((resolve, reject) => {
      db.transaction((txn) => {

        txn.executeSql(`select COUNT(*) as total from tbl_attendance where date = '${date}'`,[],(tx,res)=>{
            let count = res.rows.raw().pop()
            if(count.total >= 2){
                reject({data:0,errorMessage: 'Attendance Already Marked.'})
            }else{
                txn.executeSql(
                  `insert into tbl_attendance(latitude,longtitude,type,date,time,user_id) 
                    values(${latitude},${longitude},'${type}','${date}','${time}',${user})`,
                  [],
                  (tx, res) => {
                    if (res.rowsAffected == 1) {
                      resolve({data: res.rowsAffected,errorMessage: ''})
                    } else {
                      reject({data: res.rowsAffected,errorMessage: 'Unable to mark attendance.'})
                    }
                  }
                );
            }
        })
      });
    })
  }

export function test() {
    db.transaction(function (txn) {
        txn.executeSql(
            `insert into tbl_attendance(latitude,longtitude,type,date,time,user_id) 
            values(24.893148,67.066502,'CheckedIn','2019-03-26','09:34:44',25),
            (24.893520,67.064171,'CheckedOut','2019-03-26','19:54:23',25),
            (24.893148,67.066502,'CheckedIn','2019-03-27','09:34:44',25),
            (24.893520,67.064171,'CheckedOut','2019-03-27','19:54:23',25),
            (24.893148,67.066502,'CheckedIn','2019-03-28','09:34:44',25),
            (24.893520,67.064171,'CheckedOut','2019-03-28','19:54:23',25),
            (24.893148,67.066502,'CheckedIn','2019-03-29','09:34:44',25),
            (24.893520,67.064171,'CheckedOut','2019-03-29','19:54:23',25),
            (24.893148,67.066502,'CheckedIn','2019-03-30','09:34:44',25),
            (24.893520,67.064171,'CheckedOut','2019-03-30','19:54:23',25),
            (24.893148,67.066502,'CheckedIn','2019-04-01','09:34:44',25),
            (24.948862,67.073349,'CheckedOut','2019-04-01','19:54:23',25),
            (24.893148,67.066502,'CheckedIn','2019-04-02','09:34:44',25),
            (24.948862,67.073349,'CheckedOut','2019-04-02','19:54:23',25),
            (24.893148,67.066502,'CheckedIn','2019-04-03','09:34:44',25),
            (24.948862,67.073349,'CheckedOut','2019-04-03','19:54:23',25)`,
            [],
            function (tx, res) {
                console.log('result', res);
            }
        );
    });
}

export function test2(){
    let limitdate= moment('2019-04-08','YYYY-MM-DD').subtract(10,'days').format("YYYY-MM-DD")
    db.transaction(function (txn) {
        txn.executeSql(
            `select * from tbl_attendance where date between '${limitdate}' and '2019-04-08'`,
            [],
            function (tx, res) {
                console.log('result', res.rows.raw());
            }
        );
    });
}

export function DBgetSelectedDayAttendance(dateObj){
    return new Promise((resolve,reject)=>{
        let date = dateObj.format("YYYY-MM-DD")
        
        try{
            db.transaction(function (txn) {
                txn.executeSql(
                    `select id,latitude,longtitude,type,date,time,user_id from tbl_attendance where date='${date}'`,
                    [],
                    function (tx, res) {
                        let data = res.rows.raw()
                        console.log(data)
                        if(data.length > 0){
                            resolve({
                                dataCode: 0,
                                data: data
                            })
                        }else{
                            resolve({
                                dataCode: 1,
                                data: "Absent"
                            })
                        }
                    }
                );
            });
        }catch(e){
            reject({
                error: 1,
                data: 'Failed to get Data.'
            })
        }        
    })
}