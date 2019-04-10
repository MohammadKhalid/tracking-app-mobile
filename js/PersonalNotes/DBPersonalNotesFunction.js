import { openDatabase } from 'react-native-sqlite-storage';
import moment from "moment"

var db = openDatabase({ name: 'Coordinates.db', createFromLocation: '~/Coordinates.db', location: 'Library' }, (open) => { console.log("asdasd", open) }, (e) => { console.log(e) });


export function createNotesTable() {
    let query = `CREATE TABLE IF NOT EXISTS tbl_personal(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT, 
            note TEXT,
            subnote TEXT,
            date TEXT,
            user_id INTEGER);`;

    db.transaction(function (txn) {
        txn.executeSql(
            query,
            [],
            function (tx, res) {
                console.log('personal Notes table creation', res);
            }
        );
    });
}


export function DBInsertPersonalNote(titleText, note, subNotes, datetime,user_id) {
    return new Promise((resolve, reject) => {
        db.transaction((txn) => {

            txn.executeSql(`insert into tbl_personal(title,note,subnote,date,user_id) values('${titleText}','${note}','${subNotes}','${datetime}',${user_id})`, [], (tx, res) => {
                if (res.rowsAffected == 1) {
                    resolve({ error: false, message: 'Notes inserted.' })
                } else {
                    reject({ error: true, message: 'Unable to insert notes.' })
                }
            })
        });
    })
}

export function DBUpdatePersonalNote(titleText, note, subNotes, datetime,id) {
    return new Promise((resolve, reject) => {
        db.transaction((txn) => {

            txn.executeSql(`update tbl_personal set title='${titleText}',note='${note}',subnote='${subNotes}',date='${datetime}' where id = ${id}`, [], (tx, res) => {
                if (res.rowsAffected == 1) {
                    resolve({ error: false, message: 'Note updated.' })
                } else {
                    reject({ error: true, message: 'Unable to update note.' })
                }
            })
        });
    })
}


export function DBSelectAllNotes(titleText, note, subNotes, datetime) {
    return new Promise((resolve, reject) => {
        db.transaction((txn) => {
            txn.executeSql(`select * from tbl_personal`, [], (tx, res) => {
                let notes = res.rows.raw()
                console.log(notes)
                if (notes.length > 0) {
                    resolve({ error: false, message: '', data: notes })
                } else {
                    reject({ error: true, message: 'No Notes Available!' })
                }
            })
        });
    })
}
export function test() {
    return new Promise((resolve, reject) => {
        db.transaction((txn) => {
            txn.executeSql(`delete from tbl_personal`, [], (tx, res) => {
                let notes = res.rows.raw()
                console.log(notes)
                if (notes.length > 0) {
                    resolve({ error: false, message: '', data: notes })
                } else {
                    reject({ error: true, message: 'No notes Found.' })
                }
            })
        });
    })
}