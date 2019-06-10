import React, { Component } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    Text,
    View,
    ScrollView
} from 'react-native';
import CalendarStrip from 'react-native-calendar-strip';
import Icon from "react-native-vector-icons/FontAwesome5"
import moment from 'moment'
import { getToken } from '../Commons/Constants';
import { getTodayTask, markComplete } from './ScheduleAction';
import { getCurrentCords } from '../Attendance/AttendanceAction';
var jwtDecode = require('jwt-decode');
import Spinner from 'react-native-loading-spinner-overlay';
import Netinfo from '@react-native-community/netinfo'
import { creatScheduleTable, test2, saveBulkTask, test } from './DBSchedules';

export default class ScheduleScreen extends Component {

    constructor(props) {
        super(props)
        this.state = {
            token: null,
            incompleteTask: [],
            completedTasks: [],
            datesArray: [],
            taskMessage: 'No Task Found',
            completeTaskMessage: 'No Task Completed',
            spinner: false
        }
    }


    static navigationOptions = {
        tabBarIcon: ({ tintColor }) => (
            <Icon name="tasks" size={25} style={{ color: tintColor }} />
        )
    }


    componentDidMount() {
        this.makeDatesInMonth()
        this.didFocusListener = this.props.navigation.addListener('didFocus', async () => {
            let status = await Netinfo.isConnected.fetch()
            if(status == true){
                saveBulkTask()
            }
            creatScheduleTable()
            test2()
        getToken()
            .then(resp => {
                let user = jwtDecode(resp.token)
                this.setState({
                    token: user
                })
                if(status == true){
                    this.getTodayTask(moment().format("YYYY-MM-DD"), user.User.user_id)
                }else{
                    this.setState({
                        spinner: false
                    })
                    alert("No internet connection.")
                }
            })
            .catch(error => {

            })
        })
    }


    getTodayTask(date, user) {
        this.setState({
            spinner: true
        })
        
        getTodayTask(date, user)
            .then(response => {
                console.log(response)
                let { message, data, code } = response
                if (code == 200) {

                    let completed = data.filter(x => x.Status == 'Completed')
                    let inCompleted = data.filter(x => x.Status == 'Incomplete')
                    this.setState({
                        incompleteTask: inCompleted,
                        completedTasks: completed,
                        spinner: false
                    })
                } else {
                    this.setState({
                        incompleteTask: [],
                        completedTasks: [],
                        taskMessage: message,
                        spinner: false
                    })
                }

            })
            .catch(error => {
                this.setState({
                    spinner: false
                })
                alert("Network Failure")
            })
    }

    makeDatesInMonth() {
        let datesArray = []
        let days = moment().daysInMonth()
        let month = moment().format('MMM')
        for (let i = 0; i < days; i++) {
            datesArray.push({
                date: (i + 1),
                month: month
            })
        }
        this.setState({
            datesArray: datesArray
        })
    }

    dateSelected = (date) => {
        let { token } = this.state
        this.getTodayTask(date.format('YYYY-MM-DD'), token.User.user_id)

    }

    radioPressed = (ind, taskid) => {
        let { incompleteTask, completedTasks, token } = this.state
        // this.setState({
        //     spinner: true
        // })
        
        let Completed = incompleteTask.splice(ind, 1);
        completedTasks.push(Completed.pop())
        this.setState({
            incompleteTask: incompleteTask,
            completedTasks: completedTasks,
            spinner: false
        })
        getCurrentCords()
            .then(result => {
                markComplete(token.User.user_id, taskid, result.latitude, result.longitude, moment().format('YYYY-MM-DD'), moment().format('hh:mm:ss'))
                    .then(resp => {
                        console.log(resp)
                        // let Completed = incompleteTask.splice(ind, 1);
                        // completedTasks.push(Completed.pop())
                        // this.setState({
                        //     incompleteTask: incompleteTask,
                        //     completedTasks: completedTasks,
                        //     spinner: false
                        // })
                    })
                    .catch(error => {
                        console.log(resp)
                        this.setState({
                            spinner: false
                        })
                        alert('Unable to mark complete')
                    })
            })
            .catch(error => {
                this.setState({
                    spinner: false
                })
                alert("Unable to find location.")
            })
    }

    radioPressedIncomplete = (ind) => {
        let { incompleteTask, completedTasks } = this.state

        let inCompleted = completedTasks.splice(ind, 1);
        incompleteTask.push(inCompleted.pop())
        this.setState({
            incompleteTask: incompleteTask,
            completedTasks: completedTasks
        })
    }

    render() {
        let { incompleteTask, completedTasks, taskMessage, completeTaskMessage, spinner } = this.state

        return (
            <View style={styles.mainApp}>
                <Spinner
                    visible={spinner}
                    textContent={'Loading...'}
                // textStyle={}
                />
                <View style={styles.Box1}>
                    <Text style={styles.heading}>My Tasks</Text>
                    <CalendarStrip
                        style={{ height: 80 }}
                        calendarHeaderStyle={{ alignSelf: 'flex-start', color: 'white', marginLeft: 10 }}
                        daySelectionAnimation={{ type: 'background', highlightColor: 'white' }}
                        highlightDateNumberStyle={{ color: 'orange' }}
                        highlightDateNameStyle={{ color: 'orange' }}
                        dateNumberStyle={{ color: 'white' }}
                        dateNameStyle={{ color: 'white' }}
                        onDateSelected={(date) => {
                            this.dateSelected(date)
                        }}
                    />
                </View>

                <View style={styles.Box2}>

                    <ScrollView >
                        <Text style={styles.taskHeading}>
                            Pending Tasks
                        </Text>
                        {
                            (incompleteTask.length == 0) ?
                                <View style={styles.TaskEmptyRow}>
                                    <Text>
                                        {taskMessage}
                                    </Text>
                                </View>
                                :
                                incompleteTask.map((row, ind) => {
                                    return (
                                        <View key={ind} style={styles.TaskRow}>
                                            <TouchableOpacity onPress={this.radioPressed.bind(this, ind, row.Id)} style={styles.radioButtonView}>
                                                <View style={styles.radioButton}>

                                                </View>
                                            </TouchableOpacity>
                                            <TaskList row={row} />
                                        </View>
                                    )
                                })
                        }
                        <View style={{ alignItems: 'center' }}>
                            <View style={{ borderTopColor: 'lightgrey', borderTopWidth: 0.5, marginVertical: 10, width: '90%' }}>

                            </View>
                        </View>
                        <Text style={styles.taskHeading}>
                            Completed Tasks
                        </Text>
                        {
                            (completedTasks.length == 0) ?
                                <View style={styles.TaskEmptyRow}>
                                    <Text>
                                        {completeTaskMessage}
                                    </Text>
                                </View>
                                :
                                completedTasks.map((row, ind) => {
                                    return (
                                        <View key={ind} style={styles.TaskRow}>
                                            <View style={styles.radioButtonView}>
                                            {/* onPress={this.radioPressedIncomplete.bind(this, ind)} */}
                                                <TouchableOpacity  style={styles.radioButton}>
                                                    <View style={styles.radioButtonComptele}>

                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                            <TaskList row={row} />
                                        </View>
                                    )
                                })
                        }
                    </ScrollView>
                </View>

            </View>

        );
    }
}


function TaskList(props) {
    let { row } = props
    return (
        <View style={styles.taskSection}>
            <Text style={styles.taskSectionHeading}>
                {row.title}
            </Text>
            <Text>
                {row.description}
            </Text>
        </View>
    )
}
const styles = StyleSheet.create({
    mainApp: {
        flex: 1,
        backgroundColor: 'orange'
    },
    Box1: {
        flex: 2,
        justifyContent: 'space-evenly'
    },
    TaskRow: {
        height: 90,
        flexDirection: 'row',
        marginVertical: 5
    },
    TaskEmptyRow: {
        height: 90,
        justifyContent: 'center',
        alignItems: 'center'
    },
    taskSection: {
        flex: 6,
        justifyContent: 'space-evenly'
    },
    iconView: {
        alignItems: 'flex-end',
        marginRight: 20,
    },
    heading: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 30,
        marginLeft: 10,
    },
    taskSectionHeading: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 18
    },
    taskHeading: {
        color: 'black',
        fontSize: 25,
        textAlign: 'center',

    },
    radioButtonView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    Box: {
        width: 70,
        height: 70,
        backgroundColor: 'white',
        borderRadius: 20,
        marginHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    BoxText: {
        color: 'orange',
        fontSize: 20,
    },
    Box2: {
        flex: 6,
        backgroundColor: 'white',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        padding: 10,
    },
    row: {
        flex: 1,
        flexDirection: 'row',
    },
    container:
    {
        flex: 1,
        paddingHorizontal: 25,
        backgroundColor: 'green'
    },
    radioButton:
    {
        height: 24,
        width: 24,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    radioButtonComptele: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: 'orange'
    }
})