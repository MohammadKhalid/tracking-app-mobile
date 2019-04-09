
import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    Alert,
    BackHandler,
    AsyncStorage
} from "react-native";

import MapView, { Marker, Circle } from "react-native-maps";
import moment from "moment"
import { screenHeight, screenWidth, getToken } from "../Commons/Constants";
import CalendarStrip from 'react-native-calendar-strip';
import { markAttendance, getCurrentCords } from "./AttendanceAction";
import { creatAttendaneTable, test, test2, DBgetSelectedDayAttendance } from "./DBAttendanceFunctions";
import MapViewDirections from 'react-native-maps-directions';
import Axios from "axios";
import Polyline from '@mapbox/polyline';
var jwtDecode = require('jwt-decode');
import Spinner from 'react-native-loading-spinner-overlay';
import Icon from "react-native-vector-icons/Entypo"


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
            Error: false
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

    

    componentDidMount() {
        this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
            BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        );
        this.didFocusListener = this.props.navigation.addListener('didFocus', () => {
            this.setState({
                spinner: true
            })
            creatAttendaneTable()
            this.getType()
            test2()

            getToken()
                .then(response => {
                    this.setState({
                        token: jwtDecode(response.token)
                    })
                })
                .catch(error => {
                    this.setState({
                        token: null
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
        console.log()
        getCurrentCords()
            .then((result) => {
                markAttendance(token.User.user_id, date, type, result.latitude, result.longitude)
                    .then(resp => {
                        this.setState({
                            statusType: type,
                            spinner: false,
                            Error: false
                        })
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

    dateSelected = (date) => {
        let { statusType } = this.state
        if (date.format("YYYY-MM-DD") == moment().format("YYYY-MM-DD")) {
            if (statusType == null || statusType == 'CheckedOut') {
                this.askAttendancePermission(date, 'CheckedIn', 'Check in')
            } else {
                this.askAttendancePermission(date, 'CheckedOut', 'Check out')
            }
        } else {
            DBgetSelectedDayAttendance(date)
                .then(result => {
                    if (result.dataCode == 0) {
                        this.setState({
                            selectedDateData: result.data,
                            absentStatus: 'Present',
                            Error: false,
                            errorMessage: ''
                        })
                    } else {
                        this.setState({
                            selectedDateData: [],
                            absentStatus: result.data,
                            Error: false,
                            errorMessage: ''
                        })
                    }
                })
                .catch(error => {
                    console.log(error)
                })
        }
    }

    renderMarker(data) {
        if (data.length > 0) {
            this.renderDistance(data)
            return data.map(row => {
                return (
                    <MapView.Marker
                        key={row.id}
                        title={row.type}
                        coordinate={{
                            latitude: row.latitude,
                            longitude: row.longtitude,
                            longitudeDelta: 0.2,
                            latitudeDelta: 0.2,
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
                Axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${data[0].latitude + "," + data[0].longtitude}&destination=${data[1].latitude + "," + data[1].longtitude}&key=AIzaSyC-lBXEXkbbh2hvhZrpn2Q2snVKacI05WQ`)
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
        return <MapView.Polyline
            coordinates={data}
            strokeWidth={2}
            strokeColor="red" />
    }

    render() {
        let { spinner, statusType, Error, selectedDateData, absentStatus, coords, errorMessage } = this.state
        var timeIn = "--"
        var timeOut = "--"
        var totalHours = "--"
        if (selectedDateData.length > 0) {
            timeIn = moment(selectedDateData[0].time, 'hh:mm:ss').format('hh:mm a')
            timeOut = moment(selectedDateData[1].time, 'hh:mm:ss').format('hh:mm a')
            totalHours = moment(selectedDateData[1].time, 'hh:mm:ss').diff(moment(selectedDateData[0].time, 'hh:mm:ss'), 'hours') + ' hr(s)'
        }
        if (Error == true) {
            alert(errorMessage)
        }
        return (
            <View style={styles.container}>
                <Spinner
                    visible={spinner}
                    textContent={'Loading...'}
                // textStyle={}
                />
                <MapView

                    style={styles.mapView}
                    initialRegion={{
                        latitude: 24.89329791,
                        longitude: 67.06640881,
                        longitudeDelta: 0.05,
                        latitudeDelta: 0.05,
                    }}
                    showsUserLocation={true}
                    // onRegionChange={this.onRegionChange}
                    showsMyLocationButton={true}
                >
                    {selectedDateData.length > 0 &&
                        this.renderMarker(selectedDateData)
                    }
                    {selectedDateData.length > 0 &&
                        this.showDirection(coords)
                    }
                    {/* <MapViewDirections
                        origin={{latitude: 24.893148,longitude: 67.066502}}
                        destination={{latitude: 24.948862, longitude: 67.073349}}
                        apikey={"AIzaSyC-lBXEXkbbh2hvhZrpn2Q2snVKacI05WQ"}
                        strokeWidth={3}
                        strokeColor="hotpink"
                    /> */}
                    {/* <Circle
                        center={{ latitude, longitude }}
                        radius={20}
                        strokeColor={'#1a66ff'}
                        fillColor={'rgba(230,238,255,0.5)'}
                    /> */}
                </MapView>
                <View style={styles.contentView}>
                    <View style={styles.calenderView}>
                        {/* <Text style={styles.txtBlack}>
                            {moment().format('MMMM, YYYY')}
                        </Text> */}
                        {/* {
                            this.renderDateRound()
                        } */}
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
                    <View style={styles.cardView}>
                        <View style={styles.cardDateView}>
                            <Text style={styles.txtBlack}>
                                {moment().format('MMMM, YYYY')}
                            </Text>
                        </View>

                        <View style={styles.attendanceDetailsView}>
                            <AttendanceCardData title="Time in" value={timeIn} />
                            <AttendanceCardData title="Time Out" value={timeOut} />
                            <AttendanceCardData title="Total Time" value={totalHours} />
                            <AttendanceCardData title="Attendance" value={absentStatus} />
                        </View>
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
        justifyContent: 'center'
    },
    mapView: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    contentView: {
        justifyContent: 'space-between',
        alignItems: 'center',
        height: screenHeight - 100
    },
    calenderView: {
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
        width: screenWidth - 25,
        height: (screenHeight / 8) + 30,
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