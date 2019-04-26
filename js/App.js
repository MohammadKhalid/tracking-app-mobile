import React from 'react';
import {
  View,
  StatusBar
} from 'react-native'
import {
  createStackNavigator,
  createAppContainer,
  createMaterialTopTabNavigator
} from 'react-navigation';

import LoginScreen from './Login/Login'
import AttendanceScreen from './Attendance/Attendance'
import { appMaincolor } from './Commons/Constants';
import PersonalNotesScreen from './PersonalNotes/PersonalNotesScreen';
import AddPersonalNotes from './PersonalNotes/AddPersonalNotes';
import ViewPersonalNotes from './PersonalNotes/ViewPersonalNotes';
import ScheduleScreen from './Schedule/ScheduleScreen';
import SampleApp from './Attendance/Attendance2';


// -------------- top navigator -------------
const AppTabNavigator = createMaterialTopTabNavigator({
  attendance: AttendanceScreen ,
  schedule: ScheduleScreen,
  personalnotes: PersonalNotesScreen
},{
  swipeEnabled: true,
  tabBarPosition: 'bottom',
  tabBarOptions: {
    showIcon: true,
    showLabel: false,
    labelStyle: {
      fontSize: 15,
    },
    activeTintColor: 'white',
    // inactiveTintColor: appMainBackgroundColor,
    style: {
      backgroundColor: appMaincolor,
    },
    indicatorStyle :{
      backgroundColor: 'white'
    },
    tabStyle:{
      height: 45
    }
  }
}
);


const MainNavigator = createStackNavigator({
  navigator: {screen: LoginScreen , navigationOptions:{header: null}},
  attendance: {screen: AppTabNavigator , navigationOptions:{header: null}},
  addnotes: {screen: AddPersonalNotes , navigationOptions:{header: null}},
  viewnotes: {screen: ViewPersonalNotes , navigationOptions:{header: null}},
});


const Apps = createAppContainer(MainNavigator);
// --------------------

class App extends React.Component {
  
  render() { 
    return (
      <View style={{flex:1}}>
      <StatusBar barStyle='light-content' backgroundColor='orange'></StatusBar>
      <Apps></Apps>
      {/* <ScheduleScreen></ScheduleScreen> */}
      {/* <AttendanceScreen></AttendanceScreen> */}
      {/* <SampleApp></SampleApp> */}
      </View>
    );
  }
}

export default App;