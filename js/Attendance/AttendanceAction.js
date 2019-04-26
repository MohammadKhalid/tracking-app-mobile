import { DBMarkAttendance, DBDeleteAttendanceRow, DBUpdateTrackRow } from "./DBAttendanceFunctions";
import moment from "moment"
import Axios from "axios";
import { baseUrl } from "../Commons/Constants";


export function markAttendance(user, dateObj, type, latitude, longitude) {
    let time = moment().format("hh:mm:ss")
    let date = dateObj.format("YYYY-MM-DD")
    return new Promise(async (resolve, reject) => {
        let result = DBMarkAttendance(user, date, time, type, latitude, longitude)
            .then(resp => {
                console.log(resp)
                sendCurrentAttendance(user, date, time, type, latitude, longitude, resp.id)
                resolve(resp)
            })
            .catch(err => {
                console.log(err)
                reject(err)

            })
    })
}


export function sendCurrentAttendance(user, date, time, type, latitude, longitude, attendanceId) {
    let obj = {
        user_id: user,
        date: date,
        time: time,
        type: type,
        latitude: latitude,
        longitude: longitude
    }
    console.log(obj)
    try {
        Axios.post(baseUrl + "attendance/markAttendance", obj)
            .then(resp => {
                let { code } = resp.data
                console.log(code)
                if (code == 200) {
                    DBDeleteAttendanceRow(attendanceId)
                }
                console.log(resp)
            })
            .catch(error => {
                console.log(error)
            })
    } catch (error) {

    }
}

export function sendTransitData(user, date, time, type, latitude, longitude, trackId) {
    let obj = {
        user_id: user,
        date: date,
        time: time,
        type: type,
        latitude: latitude,
        longitude: longitude
    }
    try {
        Axios.post(baseUrl + `attendance/insertTrackData`, obj)
            .then(resp => {
                let { code } = resp.data
                if (code == 200) {
                    DBUpdateTrackRow(trackId)
                } else {
                    console.log("in insert tracj api else")
                }
            })
            .catch(error => {
                console.log('in insert tracj api catch')
            })
    } catch (error) {

    }
}

export function fetchAttendance(date, user) {
    return new Promise((resolve, reject) => {
        let tmp = date.format('YYYY-MM-DD')
        try {
            Axios.get(baseUrl + `attendance/getAttendance/${user}/${tmp}`)
                .then(resp => {

                    resolve({
                        code: 200,
                        data: resp.data.data,
                        dataCode: 0
                    })

                })
                .catch(error => {
                    reject({
                        code: 500,
                        data: [],
                        message: 'Network error'
                    })
                })
        } catch (error) {

        }
    })
}

export function fetchTasksMarkers(date, user) {
    return new Promise((resolve, reject) => {
        let tmp = date.format('YYYY-MM-DD')
        Axios.get(baseUrl + `task/taskMarker/${user}/${tmp}`)
            .then(resp => {
                if (resp.data.data.length > 0) {
                    resolve({
                        code: 200,
                        data: resp.data.data,
                        dataCode: 0
                    })
                } else {
                    resolve({
                        code: 200,
                        data: resp.data.data,
                        dataCode: 1
                    })
                }
            })
            .catch(error => {
                reject({
                    code: 500,
                    data: [],
                    message: 'Network error'
                })
            })

    })
}

export function getCurrentCords() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                })
            },
            (error) => {
                reject({
                    error: true,
                    message: 'failed to get location'
                })
            },
            { enableHighAccuracy: false, timeout: 200000, maximumAge: 1000 },
        );
    })
}
