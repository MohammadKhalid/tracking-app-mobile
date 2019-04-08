import { DBMarkAttendance } from "./DBAttendanceFunctions";
import moment from "moment"
import Axios from "axios";
import { baseUrl } from "../Commons/Constants";


export function markAttendance(user,dateObj,type,latitude,longitude){
    let time = moment().format("hh:mm:ss")
    let date = dateObj.format("YYYY-MM-DD")
    return new Promise(async (resolve,reject)=>{
        let result = DBMarkAttendance(user,date,time,type,latitude,longitude)
        .then(resp=>{
            console.log(resp)
            sendCurrentAttendance(user,date,time,type,latitude,longitude)
            resolve(resp)
        })
        .catch(err=>{
            console.log(err)
            reject(err)

        })
    })
}


export function sendCurrentAttendance(user,date,time,type,latitude,longitude){
    let obj = {
        user_id: user,
        date: date,
        time: time,
        type: type,
        latitude: latitude,
        longitude: longitude
    }
    try {
        Axios.post(baseUrl+"attendance/markAttendance",obj)
        .then(resp =>{
            console.log(resp)
        })
        .catch(error=>{
            console.log(error)
        })
    } catch (error) {
        
    }
}

export function getCurrentCords() {
    return new Promise((resolve,reject)=>{
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
            { enableHighAccuracy: true, timeout: 200000, maximumAge: 1000 },
        );
    })
}
