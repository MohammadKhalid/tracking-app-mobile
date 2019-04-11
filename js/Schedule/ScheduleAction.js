import moment from "moment"
import Axios from "axios";
import { baseUrl } from "../Commons/Constants";


export function getTodayTask(date, user) {
    return new Promise((resolve, reject) => {
        try {
            Axios.get(baseUrl + `task/userTasks/${user}/${date}`)
                .then(response => {
                    resolve(response.data)
                })
                .catch(error => {
                    reject(error)
                })
        } catch (error) {
            reject({
                'message': 'network error',
                'err': error,
                "code": 500
            })
        }
    })
}

export function markComplete(userid,taskid,latitude,longitude,date,time) {
    return new Promise((resolve, reject) => {

        try {
            let obj={
                userid,
                taskid,
                latitude,
                longitude,
                date,
                time
            }
            Axios.post(baseUrl + `task/markComplete`,obj)
                .then(response => {
                    resolve(response.data)
                })
                .catch(error => {
                    reject(error)
                })
        } catch (error) {
            reject({
                'message': 'network error',
                'err': error,
                "code": 500
            })
        }
    })
}
