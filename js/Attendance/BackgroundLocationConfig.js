import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import { getToken } from '../Commons/Constants';
import moment from "moment"
import { DBSaveTransitData } from './DBAttendanceFunctions';
var jwtDecode = require('jwt-decode');
import NetInfo from "@react-native-community/netinfo";
import { sendTransitData } from './AttendanceAction';




export const onBackground = () => BackgroundGeolocation.on('background', () => {
  console.log('[INFO] App is in background');
});

export const onForeground = () => BackgroundGeolocation.on('foreground', () => {
  console.log('[INFO] App is in foreground');
  // BackgroundGeolocation.stop(); 
});

export function start() {
  BackgroundGeolocation.configure({
    desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
    stationaryRadius: 1,
    distanceFilter: 1,
    debug: false,
    startOnBoot: false,
    stopOnTerminate: false,
    locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
    interval: 30000,
    fastestInterval: 10000,
    activitiesInterval: 15000,
    stopOnStillActivity: false,
  });
  BackgroundGeolocation.start()
}

export function stop() {
  BackgroundGeolocation.stop()
}
BackgroundGeolocation.on('start',() => {
  console.log('[INFO] BackgroundGeolocation service has been started');
  BackgroundGeolocation.on('location', async(location) => {
    
    let {latitude,longitude,id} = location
    console.log(latitude)
    let token = await getToken()
    if(token.token !== null){
      let user = jwtDecode(token.token).User.user_id
      console.log("after check",user)
      let date = moment().format("YYYY-MM-DD")
      let time = moment().format("hh:mm:ss")
      DBSaveTransitData(user,date,time,"on route",latitude,longitude,id)
      .then(async resp=>{
        let connected = await NetInfo.isConnected.fetch()
        if(connected == true){
          sendTransitData(user,date,time,"on route",latitude,longitude,resp.id)
        }else{
          console.log("update Transit sync")
        }
      })
      .catch(error=>{
        console.log(error)
      })
    }
    
  });
});

BackgroundGeolocation.on('stop', () => {
  console.log('[INFO] BackgroundGeolocation service has been stopped');
  // BackgroundGeolocation.deleteAllLocations(()=>{
  //   console.log('delete')
  // },()=>{console.log('eroorrr')})
});