import { baseUrl } from "../Commons/Constants";
import Axios from "axios";

export function login(email,password){
    return new Promise((resolve,reject)=>{
        let obj ={
            email,
            password
        }
        Axios.post(baseUrl+'employee/login',obj)
        .then(response =>{
            resolve(response.data)
        })
        .catch(error => {
            reject(error)
        })
    })
}