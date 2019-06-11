import moment from "moment"
import Axios from "axios";
import { baseUrl } from "../Commons/Constants";
import { DBMarkComplete } from "./DBSchedules";
import NetInfo from "@react-native-community/netinfo";


export function getTodayTask(date, user) {
    return new Promise((resolve, reject) => {
        try {
            Axios.get(baseUrl + `task/userTasks/${user}/${date}`)
                .then(response => {
                    resolve(response.data)
                })
                .catch(error => {
                    reject({
                        'message': 'network error',
                        'err': error,
                        "code": 500
                    })
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

export function markComplete(userid, taskid, latitude, longitude, date, time) {
    return new Promise(async (resolve, reject) => {
        try {
            let obj = {
                userId:userid,
                latitude,
                longitude,
                date
            }

            let connected = await NetInfo.isConnected.fetch()
            if (connected == true) {
                Axios.put(baseUrl + `task/markComplete/${taskid}`, obj)
                    .then(response => {
                        let { code } = response.data
                        if (code == 200) {
                            resolve(response.data)
                        }
                    })
                    .catch(error => {
                        console.log(error, "in  mark complete api")
                        reject(error)
                    })
            } else {
                DBMarkComplete(userid, taskid, time, date, latitude, longitude)
                    .then(async resp => {
                        console.log(resp)
                    })
                    .catch(err => {
                        console.log(error,"in  mark complete Db erreor")
                        reject(err)
                    })
            }

        } catch (error) {
            reject({
                'message': 'network error',
                'err': error,
                "code": 500
            })
        }
    })
}
