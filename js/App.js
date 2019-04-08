import React from 'react';
import {
  View,
  StatusBar
} from 'react-native'
import {
  createStackNavigator,
  createAppContainer,
} from 'react-navigation';

import LoginScreen from './Login/Login'
import AttendanceScreen from './Attendance/Attendance'

const MainNavigator = createStackNavigator({
  navigator: {screen: LoginScreen , navigationOptions:{header: null}},
  attendance: {screen: AttendanceScreen , navigationOptions:{header: null}},
});


const Apps = createAppContainer(MainNavigator);
// --------------------

class App extends React.Component {
  
  render() { 
    return (
      <View style={{flex:1}}>
      <StatusBar barStyle='light-content' backgroundColor="black"></StatusBar>
      <Apps></Apps>
      {/* <AttendanceScreen></AttendanceScreen> */}
      </View>
    );
  }
}

export default App;