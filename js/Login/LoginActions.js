import { baseUrl } from "../Commons/Constants";
import {
AsyncStorage
} from 'react-native'
import Axios from "axios";

export function login(email,password){
    return new Promise((resolve,reject)=>{
        let obj ={
            email,
            password
        }
        Axios.post(baseUrl+'employee/login',obj)
        .then(response =>{
            AsyncStorage.setItem('token',response.data.token)
            resolve(response.data)
        })
        .catch(error => {
            reject(error)
        })
    })
}