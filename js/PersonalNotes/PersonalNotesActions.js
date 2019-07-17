import { baseUrl } from "../Commons/Constants";
import {
    AsyncStorage
} from 'react-native'
import Axios from "axios";
import NetInfo from "@react-native-community/netinfo";
import {  DBInsertPersonalNote } from './DBPersonalNotesFunction';

export function PostPersonalNote(titleText,note,subNotes,datetime,user_id) {
    return new Promise(async(resolve, reject) => {

        let jsonArray = [];
        let connected = await NetInfo.isConnected.fetch()
        if(connected == true){

            DBInsertPersonalNote(titleText,note,subNotes,datetime,user_id)
            .then(response=>{
                this.setState({
                    spinner: false
                })
                this.props.navigation.navigate('personalnotes')
            })
            .catch(error=>{
                this.setState({
                    spinner: false,
                    errorMessage: error.message,
                })
                alert(error.message)
            })

            let obj = {
                titleText,
                note,
                subNotes,
                datetime,
                user_id
            }

            jsonArray.push(obj);
            console.log(jsonArray);

            Axios.post(baseUrl + 'notes/saveNotes', {notes: jsonArray,userId: user_id})
            .then(response => {
                console.log(response);
                resolve(response.data)
            })
            .catch(error => {
                console.log(error);
                let obj = {
                    code: 300,
                    data: '',
                    message: 'Network error.'
                }
                reject(obj)
            })
        }else{

            DBInsertPersonalNote(titleText,note,subNotes,datetime,user_id)
            .then(response=>{
                this.setState({
                    spinner: false
                })
                this.props.navigation.navigate('personalnotes')
            })
            .catch(error=>{
                this.setState({
                    spinner: false,
                    errorMessage: error.message,
                })
                alert(error.message)
            })
          
        }


        
        // Axios.post(baseUrl + 'personal/saveNotes', obj)
        //     .then(response => {
        //         AsyncStorage.setItem('token', response.data.token)
        //         resolve(response.data)
        //     })
        //     .catch(error => {
        //         let obj = {
        //             code: 300,
        //             data: '',
        //             message: 'Network error.'
        //         }
        //         reject(obj)
        //     })
    })
}