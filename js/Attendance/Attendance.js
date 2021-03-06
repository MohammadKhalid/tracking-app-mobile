
import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    Alert,
    BackHandler,
    AsyncStorage,
    Image
} from "react-native";

import MapView, { Marker, Circle } from "react-native-maps";
import moment from "moment"
import { screenHeight, screenWidth, getToken } from "../Commons/Constants";
import CalendarStrip from 'react-native-calendar-strip';
import { markAttendance, getCurrentCords, fetchAttendance, fetchTasksMarkers } from "./AttendanceAction";
import { creatAttendaneTable, test, test2, DBgetSelectedDayAttendance, creatTrackingTable, syncBulkTrackData, syncBulkAttendanceData } from "./DBAttendanceFunctions";
import Axios from "axios";
import Polyline from '@mapbox/polyline';
var jwtDecode = require('jwt-decode');
import Spinner from 'react-native-loading-spinner-overlay';
import Icon from "react-native-vector-icons/Entypo"
import NetInfo from "@react-native-community/netinfo";
import { backgroundConfig, onBackground, onForeground, start, stop } from "./BackgroundLocationConfig";
import ParallaxScrollView from 'react-native-parallax-scroll-view';

const BOX_HEIGHT = (screenHeight / 8) + 30
export default class Attendance extends Component {
    constructor(props) {
        super(props)
        this.state = {
            currentWeek: [],
            region: {},
            latitude: 0,
            longitude: 0,
            selectedDate: null,
            statusType: null,
            errorMessage: '',
            selectedDateData: [],
            absentStatus: '',
            coords: [],
            token: null,
            spinner: true,
            Error: false,
            selectedDateTasks: [],
        }

        this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
            BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        );
    }

    static navigationOptions = {
        tabBarIcon: ({ tintColor }) => (
            <Icon name="location-pin" size={25} style={{ color: tintColor }} />
        )
    }

    onBackButtonPressAndroid = () => {

        if (this.props.navigation.isFocused()) {
            BackHandler.exitApp()
        } else {
            console.log("in backpressandroid else")
        }

        return true
    }



    async componentDidMount() {
        this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
            BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        );
        this.didFocusListener = this.props.navigation.addListener('didFocus', async () => {
            this.setState({
                spinner: true
            })
            creatTrackingTable()
            creatAttendaneTable()

            this.getType()
            test2()
            getToken()
                .then(response => {
                    this.setState({
                        token: jwtDecode(response.token),
                        spinner: false
                    })
                })
                .catch(error => {
                    this.setState({
                        token: null,
                        spinner: false
                    })
                })
            getCurrentCords()
                .then(result => {
                    this.setState({
                        latitude: result.latitude,
                        longitude: result.longitude,
                        spinner: false,
                        Error: false
                    });
                })
                .catch(error => {
                    this.setState({
                        errorMessage: 'Unable to find Location.',
                        spinner: false,
                        Error: true
                    })
                })
            let connected = await NetInfo.isConnected.fetch()
            if (connected == true) {
                syncBulkTrackData()
                // syncBulkAttendanceData()
            }
        })
    }

    async getType() {
        let type = await AsyncStorage.getItem('type')
        this.setState({
            statusType: type
        })
    }


    askAttendancePermission(date, type, msg) {
        Alert.alert(
            'Attendance',
            `${msg} for today?`,
            [
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), },
                { text: 'Ok', onPress: () => this.processAttendance(date, type) },
            ],
            { cancelable: false },
        );
    }

    processAttendance(date, type) {
        let { token } = this.state
        this.setState({
            spinner: true
        })

        getCurrentCords()
            .then((result) => {
                markAttendance(token.user.id, date, type, result.latitude, result.longitude)
                    .then(resp => {
                        this.setState({
                            statusType: type,
                            spinner: false,
                            Error: false
                        })
                        if (type == 'CheckedIn') {
                            start()
                        } else if (type == 'CheckedOut') {
                            stop()
                        }
                        AsyncStorage.setItem('type', type)
                    })
                    .catch(err => {
                        this.setState({
                            errorMessage: err.errorMessage,
                            Error: true,
                            spinner: false
                        })
                    })
            })
            .catch(error => {
                this.setState({
                    errorMessage: 'Unable to get Coordinates',
                    Error: true,
                    spinner: false
                })
            })
    }

    dateSelected = async (date) => {
        let { statusType, token } = this.state
        if (date.format("YYYY-MM-DD") == moment().format("YYYY-MM-DD")) {
            if (statusType == null || statusType == 'CheckedOut') {
                this.askAttendancePermission(date, 'CheckedIn', 'Check in')
            } else {
                this.askAttendancePermission(date, 'CheckedOut', 'Check out')
            }
        }
        // else {
        let attendanceResult = await fetchAttendance(date, token.user.id)
        if (attendanceResult.code == 200) {
            this.setState({
                selectedDateData: attendanceResult.data,
                Error: false,
                errorMessage: ''
            })
        } else if (attendanceResult.code == 500) {
            this.setState({
                selectedDateData: []
            })
            alert('Sever failed to serve request.')
        } else {
            this.setState({
                selectedDateData: []
            })
            alert('Network error.')
        }
    }

    renderMarker(data) {
        // this.renderDistance(data)
        // this.showDirection(data)
        if (data.length > 0) {
            return data.map((row, ind) => {
                return (
                    <MapView.Marker
                        key={ind}
                        title={(row['tbl_schedule.Status'] != null) ? row['tbl_schedule.Status'] : (row['tbl_Attenence.Status'] != null) ? row['tbl_Attenence.Status'] : "on way " + moment(row.time, "hh:mm:ss").format("hh:mm a")}
                        coordinate={{
                            latitude: row.Lattitude,
                            longitude: row.Longitude,
                            longitudeDelta: 0.05,
                            latitudeDelta: 0.05,
                        }}
                    />
                )
            })
        } else {
            console.log('in rendermarker else')
        }
    }

    renderDistance(data) {
        if (data.length > 0) {
            try {
                Axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${data[0].latitude + "," + data[0].longtitude}&destination=${data[1].latitude + "," + data[1].longtitude}&key=AIzaSyAohZ7btYPVl4_ABdRmMOO7t2Jo9cQF7s4`)
                    .then(result => {

                        let points = Polyline.decode(result.data.routes[0].overview_polyline.points)
                        console.log(result.data.routes[0].overview_polyline.points)
                        let coords = points.map((point, index) => {
                            return {
                                latitude: point[0],
                                longitude: point[1]
                            }
                        })
                        this.setState({
                            coords: coords
                        })
                    })
                    .catch(error => {
                        console.log(error)
                        this.setState({
                            errorMessage: 'Error in fetch api'
                        })
                    })

            } catch (error) {
                this.setState({
                    errorMessage: 'Error in fetch points function'
                })
            }

        } else {
            console.log('in renderdistance else')
        }
    }

    showDirection(data) {
        let coords = data.map(row => { return { latitude: row.Lattitude, longitude: row.Longitude } })
        console.log(coords)
        return <MapView.Polyline
            coordinates={coords}
            strokeWidth={2}
            strokeColor="red" />
    }

    render() {
        let { spinner, statusType, Error, scrollY, extended, selectedDateData, absentStatus, selectedDateTasks, coords, errorMessage, latitude, longitude } = this.state
        var timeIn = "--"
        var timeOut = "--"
        var totalHours = "--"
        if (Error == true) {
            alert(errorMessage)
        }
        return (
            <View style={styles.container}>
                {/* <StatusBar  hidden={true} ></StatusBar> */}
                <Spinner
                    visible={spinner}
                    textContent={'Loading...'}
                // textStyle={}
                />
                <View style={styles.contentView}>
                    <View style={{ flex: 5, width: screenWidth }}>
                        <ParallaxScrollView
                            backgroundColor="orange"
                            parallaxHeaderHeight={screenHeight - 250}
                            contentBackgroundColor="orange"
                            renderForeground={() => (
                                <View style={styles.container}>
                                    <MapView
                                        style={styles.mapView}
                                        region={{
                                            latitude: latitude,
                                            longitude: longitude,
                                            longitudeDelta: 0.3,
                                            latitudeDelta: 0.3,
                                        }}

                                        showsUserLocation={true}
                                    // onRegionChange={this.onRegionChange}
                                    // showsMyLocationButton={true}
                                    >
                                        {selectedDateTasks.length > 0 &&
                                            this.renderMarker(selectedDateTasks)
                                        }
                                        {selectedDateTasks.length > 0 &&
                                            this.showDirection(selectedDateTasks)
                                        }

                                    </MapView>
                                    <CalendarStrip
                                        style={{ height: 100 }}
                                        calendarHeaderStyle={{ alignSelf: 'flex-start', color: 'black' }}
                                        daySelectionAnimation={{ type: 'border', borderHighlightColor: 'grey', borderWidth: 1 }}
                                        highlightDateNumberStyle={(statusType == null || statusType == 'CheckedOut') ? styles.dateGreen : styles.dateRed}
                                        highlightDateNameStyle={{ color: 'black' }}
                                        dateNameStyle={{ color: 'black' }}
                                        dateNumberStyle={{ color: 'black', fontSize: 13 }}
                                        onDateSelected={(date) => {
                                            this.dateSelected(date)
                                        }}
                                    />
                                </View>
                            )}>
                            <View>
                                <Text style={{ marginLeft: 10, fontSize: 30, marginVertical: 10, color: 'white' }}>
                                    Attendance Report
                                </Text>
                                {
                                    (selectedDateData.length > 0) ?

                                        selectedDateData.map((row, ind) => {
                                            let currentDate = moment(row.date,'YYYY-MM-DD').format('YYYY-MM-DD')
                                            if(row.isPresent == 1){
                                                absentStatus = <Image style={styles.pic} source={require('../../assets/images/Tick-01.png')} />
                                                timeIn = moment(row.checkInTime, 'HH:mm:ss').format("hh:mm a")
                                                timeOut = moment(row.checkOutTime, 'HH:mm:ss').format("hh:mm a")
                                                totalHours = moment(row.checkOutTime, 'HH:mm:ss').diff(moment(row.checkInTime, 'HH:mm:ss'), 'hours') + ' hr(s)'
                                            }
                                            else if(row.isPresent == 2){
                                                absentStatus = <Image style={styles.pic} source={require('../../assets/images/warn.png')} />
                                                timeIn = moment(row.checkInTime, 'HH:mm:ss').format("hh:mm a")
                                                timeOut = "--"
                                                totalHours = "--"
                                            }else{
                                                absentStatus = <Image style={styles.pic} source={require('../../assets/images/Cross-01.png')} />
                                                timeIn = "--"
                                                timeOut = "--"
                                                totalHours = "--"
                                            }
                                            return (

                                                <View key={ind} style={{ height: BOX_HEIGHT, width: screenWidth - 25, marginHorizontal: 10, backgroundColor: 'white', borderRadius: 5, marginVertical: 5 }}>
                                                    <View style={styles.cardDateView}>
                                                        <Text style={styles.txtBlack}>
                                                            {currentDate}
                                                        </Text>
                                                    </View>

                                                    <View style={styles.attendanceDetailsView}>
                                                        <AttendanceCardData title="Time in" value={timeIn} />
                                                        <AttendanceCardData title="Time Out" value={timeOut} />
                                                        <AttendanceCardData title="Total Time" value={totalHours} />
                                                        <AttendanceCardData title="Attendance" value={absentStatus} />
                                                    </View>
                                                </View>
                                            )
                                        })
                                        :
                                        <View style={{ height: BOX_HEIGHT, width: screenWidth - 25, marginHorizontal: 10, backgroundColor: 'white', borderRadius: 5, marginVertical: 5 }}>
                                            <View style={styles.cardDateView}>
                                                <Text style={styles.txtBlack}>
                                                    {moment().format('DD MMMM,YYYY')}
                                                </Text>
                                            </View>

                                            <View style={styles.attendanceDetailsView}>
                                                <AttendanceCardData title="Time in" value={timeIn} />
                                                <AttendanceCardData title="Time Out" value={timeOut} />
                                                <AttendanceCardData title="Total Time" value={totalHours} />
                                                <AttendanceCardData title="Attendance" value={absentStatus} />
                                            </View>
                                        </View>
                                }
                            </View>
                        </ParallaxScrollView>
                    </View>
                </View>
            </View>
        )
    }
}

function AttendanceCardData(props) {
    return (
        <View style={styles.detailCol}>
            <Text style={[{ fontWeight: 'bold' }, styles.txtBlack]}>
                {props.title}
            </Text>
            <Text style={styles.txtBlack}>
                {props.value}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // justifyContent: 'center',
        // alignItems: 'center'
    },
    pic: {
        width: 20,
        height: 20,
        borderRadius: 20 / 2,
        borderColor: 'grey',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        //backgroundColor: 'white',

    },
    stickySection: {
        height: 70,
        width: 300,
        justifyContent: 'flex-end'
    },
    mapView: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    contentView: {
        // justifyContent: 'space-between',
        flex: 1,
        alignItems: 'center',
        // height: screenHeight - 200
        // height: "100%"
    },
    calenderView: {
        flex: 2,
        width: screenWidth - 25,
        justifyContent: 'space-between'
    },
    calenderRow: {
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    RoundDateView: {
        width: 22,
        height: 22,
        borderWidth: 1,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center'
    },
    RoundDateMainView: {
        width: 50,
        height: 50,
        borderWidth: 2,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'grey'
    },
    cardView: {
        backgroundColor: 'white',
        borderRadius: 15,
        elevation: 5,
    },
    cardDateView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: 'lightgrey',
        borderBottomWidth: 1
    },
    attendanceDetailsView: {
        flex: 2,
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    detailCol: {
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    txtBlack: {
        color: 'black'
    },
    dateRed: {
        fontSize: 22,
        color: 'red'
    },
    dateRed: {
        fontSize: 22,
        color: 'red'
    },
    dateGreen: {
        fontSize: 22,
        color: "green"
    }

})