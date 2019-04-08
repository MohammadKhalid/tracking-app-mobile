import { DBMarkAttendance } from "./DBAttendanceFunctions";
import moment from "moment"


export function markAttendance(user,dateObj,type,latitude,longitude){
    let time = moment().format("hh:mm:ss")
    let date = dateObj.format("YYYY-MM-DD")
    return new Promise(async (resolve,reject)=>{
        let result = await DBMarkAttendance(user,date,time,type,latitude,longitude)
        console.log(result)
    })
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
