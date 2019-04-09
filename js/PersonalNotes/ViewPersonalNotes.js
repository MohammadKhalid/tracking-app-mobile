import React, { Component } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Text,
    View,
    Image,
    KeyboardAvoidingView,
    StatusBar, UIManager, findNodeHandle, ScrollView,
} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import IconE from "react-native-vector-icons/Entypo"
import IconM from "react-native-vector-icons/MaterialCommunityIcons"
import moment from 'moment'
import DatePicker from 'react-native-datepicker'
import { DBUpdatePersonalNote } from './DBPersonalNotesFunction';


export default class ViewPersonalNotes extends Component {

    constructor(props) {
        super(props)
        this.state = {
            datetime: '',
            titleText: '',
            note: '',
            subNotes: '',
            Error: false,
            errorMessage: '',
            spinner: false,
            id: 0
        }
    }

    componentDidMount(){
        let row = this.props.navigation.getParam('data')
        this.setState({
            titleText: row.title,
            note: row.note,
            datetime: row.date,
            subNotes: row.subnote,
            id: row.id
        })
    }

    updateTask = () =>{
        let {titleText,note,subNotes,datetime,id} = this.state
        DBUpdatePersonalNote(titleText, note, subNotes, datetime,id)
        .then(response=>{
            if(response.error == false){
                this.props.navigation.navigate('personalnotes')
            }
        })
        .catch(error=>{
            alert('Unable to Update.')
        })
    }


    render() {

        let {datetime,Error,errorMessage,spinner,titleText,note,subNotes}= this.state
        
        return (

            <View style={styles.mainApp}>
            <Spinner
                    visible={spinner}
                    textContent={'Loading...'}
                // textStyle={}
                />
                <View style={styles.Box1}>
                    <TouchableOpacity onPress={()=> this.props.navigation.navigate('personalnotes')} style={{flex: 1, alignItems: 'center',justifyContent: 'center'}}>
                        <IconM name="arrow-left" size={25} color="white" ref={this.onRef} />
                    </TouchableOpacity>
                    <View style={{flex: 7}}>
                        <Text style={styles.heading}>{titleText}</Text>
                    </View>
                </View>

                <View style={styles.Box2}>

                    <ScrollView>
                        <View style={styles.Box3}>
                            <Text style={styles.heading1}>Your Title</Text>
                            <TextInput style={{ height: 40 }}
                                placeholder="Enter Title!"
                                onChangeText={(titleText) => this.setState({ titleText })}
                                value={titleText}
                            />
                        </View>
                        <View style={styles.Box3}>
                            <View style={styles.row}>
                                <IconE name="menu" size={20} color="black" ref={this.onRef} />
                                <View>
                                    <Text style={styles.subHeading}>Your Note</Text>
                                </View>
                            </View>
                            <TextInput style={{ height: 40 }}
                                placeholder="Type your note here!"
                                onChangeText={(note) => this.setState({ note })}
                                value={note}
                            />
                        </View>
                        <View style={styles.Box3}>
                            <View style={styles.row}>
                                <IconM name="calendar-clock" size={15} color="black" ref={this.onRef} />
                                <View>
                                    <Text style={styles.subHeading}>Add Date / Time</Text>
                                </View>
                            </View>
                            <DatePicker
                                style={{ width: 200 }}
                                mode="datetime"
                                format="DD-MM-YYYY HH:mm"
                                confirmBtnText="Confirm"
                                date={(datetime == null || datetime == '')? null: moment(datetime, 'DD-MM-YYYY HH:mm').format('DD-MM-YYYY hh:mm a')}
                                cancelBtnText="Cancel"
                                placeholder="Select date and time"
                                customStyles={{
                                    dateIcon: {
                                        position: 'absolute',
                                        left: 0,
                                        top: 4,
                                        marginLeft: 0
                                    },
                                    dateInput: {
                                        marginLeft: 36
                                    }
                                }}
                                // minuteInterval={10}
                                onDateChange={(datetime) => { this.setState({ datetime: datetime }); }}
                            />
                            
                        </View>


                        <View style={styles.Box3}>
                            <View style={styles.row}>
                                <IconE name="level-down" size={15} color="black" ref={this.onRef} />
                                    <Text style={styles.subHeading}>Sub Notes</Text>
                            </View>
                                <TextInput style={{ height: 40 }}
                                    placeholder="Type Additional Notes!"
                                    onChangeText={(subNotes) => this.setState({ subNotes })}
                                    value={subNotes}
                                />
                        </View>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableOpacity style={styles.btn} onPress={this.updateTask} >
                                <Text style={styles.btnView}>Update</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>

            </View>
        );
    }
}
const styles = StyleSheet.create({
    mainApp: {
        flex: 1,
        backgroundColor: 'orange'
    },
    Box1: {
        flex: 1,
        backgroundColor: 'orange',
        alignItems: 'center',
        flexDirection: 'row'
    },
    heading: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 25,
    },
    subHeading:{
        fontWeight: "bold", 
        fontSize: 15, 
        marginLeft: 10, 
        color: 'black' 
    },
    heading1: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 25,
    },
    Box2: {
        flex: 6,
        backgroundColor: 'white',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        padding: 10,
    },
    Box3: {
        marginHorizontal: 5,
        marginVertical: 5,
        padding: 10,
        height: 110,
        justifyContent: 'space-around'
    },
    row: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    btn: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,
        borderRadius: 20,
        borderColor: 'orange',
        borderWidth: 1,
        width: '60%',
        backgroundColor: 'orange',
        height: 35,
    },
    btnView: {
        fontSize: 20,
        color: 'white'
    },
})