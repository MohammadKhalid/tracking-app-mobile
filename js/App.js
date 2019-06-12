import React from 'react';
import {
  View,
  StatusBar,
  Alert
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
import { tableDrops } from './Schedule/DBSchedules';
import IconM from "react-native-vector-icons/FontAwesome"
// -------------- top navigator -------------
const AppTabNavigator = createMaterialTopTabNavigator({
  attendance: AttendanceScreen,
  schedule: ScheduleScreen,
  personalnotes: PersonalNotesScreen,
  logout: {
    screen: () => null,
    navigationOptions: {
      tabBarOnPress: ({ navigation }) => {
        Alert.alert(
          'Logout',
          `Are you sure you wanr to logout?`,
          [
            { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), },
            {
              text: 'Ok', onPress: () => {
                tableDrops()
                navigation.navigate('navigator')
              }
            },
          ],
          { cancelable: false },
        );

      },
      tabBarIcon: ({ tintColor }) => (<IconM name="power-off" size={25} style={{ color: tintColor }} />),
    }
  }
}, {
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
      indicatorStyle: {
        backgroundColor: 'white'
      },
      tabStyle: {
        height: 45
      }
    }
  }
);


const MainNavigator = createStackNavigator({
  navigator: { screen: LoginScreen, navigationOptions: { header: null } },
  attendance: { screen: AppTabNavigator, navigationOptions: { header: null } },
  addnotes: { screen: AddPersonalNotes, navigationOptions: { header: null } },
  viewnotes: { screen: ViewPersonalNotes, navigationOptions: { header: null } },
});


const Apps = createAppContainer(MainNavigator);
// --------------------

class App extends React.Component {

  render() {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar barStyle='light-content' backgroundColor='orange'></StatusBar>
        <Apps></Apps>
      </View>
    );
  }
}

export default App;