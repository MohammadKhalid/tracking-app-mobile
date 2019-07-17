import {
Dimensions,
AsyncStorage
} from "react-native"


export const screenHeight = Dimensions.get('window').height;
export const screenWidth = Dimensions.get('window').width;

export const appMaincolor = "orange"

export const baseUrl = 'http://192.168.0.131:3000/api/'


export function getToken(){
    return new Promise(async (resolve,reject)=>{
        let token = await AsyncStorage.getItem('token')
        if(token !== null){
            resolve({token: token})
        }else{
            reject({token: null})
        }
    })
}