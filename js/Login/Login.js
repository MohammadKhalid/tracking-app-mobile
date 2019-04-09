import React, { Component } from 'react';
import {
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  Image,
  ToastAndroid,
  AsyncStorage,
  ImageBackground,
  KeyboardAvoidingView
} from 'react-native';

import { login } from "./LoginActions"
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Spinner from 'react-native-loading-spinner-overlay';
import { screenHeight } from '../Commons/Constants';

export default class Login extends Component {

  constructor(props) {
    super(props)
    this.state = {
      email: '',
      password: '',
      spinner: false
    }
  }
  async componentWillMount() {

    let token = await AsyncStorage.getItem('token')
    if (token !== null) {
      this.props.navigation.navigate('attendance')
    }
  }
  submit = () => {
    console.log('asddsad')
    let { email, password } = this.state
    this.setState({
      spinner: true
    })
    login(email, password)
      .then(response => {
        let { err, code, message } = response
        if (code == 500) {
          this.setState({
            spinner: false
          })
          ToastAndroid.showWithGravityAndOffset(
            err,
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM,
            25,
            50
          );
        } else {
          this.setState({
            spinner: false
          })
          ToastAndroid.showWithGravityAndOffset(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM,
            25,
            50
          );
          console.log(response)
          this.props.navigation.navigate('attendance')
        }
      })
      .catch(error => {
        this.setState({
          spinner: false
        })
        ToastAndroid.showWithGravityAndOffset(
          'Network error',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
          25,
          50
        );
      })

      setTimeout(() => {
        this.setState({
          spinner: false
        })
        ToastAndroid.showWithGravityAndOffset(
          'Unable to connect',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
          25,
          50
        );
      }, 10000);
  }

  render() {
    return (
      <ImageBackground source={require('../../assets/images/whole-back.jpg')} style={styles.container}>
          <Spinner
            visible={this.state.spinner}
            textContent={'Loading...'}
          // textStyle={}
          />


          <View style={styles.logoView}>
            <Image source={require('../../assets/images/tazza-logo.png')}/> 
          </View>
          <View style={styles.formView}>
            <View style={{ flex: 1,justifyContent: 'center',alignItems: 'center' }}>
            <Image  source={require('../../assets/images/sign-in-logo.png')}/> 
            </View>
            <View style={[styles.textInputViewGroup]}>
              <View style={styles.textInputView}>
                <Icon name="email" size={25} />
                <TextInput
                  onChangeText={(text) => { this.setState({ email: text }) }}
                  style={{ width: '100%' }}
                  placeholder='Email'
                />
              </View>
              <View style={styles.textInputView}>
                <Icon name="lock-outline" size={25} />
                <TextInput
                  onChangeText={(text) => { this.setState({ password: text }) }}
                  style={{ width: '100%' }}
                  placeholder='Password'
                  secureTextEntry={true}
                />
              </View>
              {/* <TouchableOpacity onPress={this.submit} style={styles.btn}> */}
              <Text onPress={this.submit} style={{ fontSize: 30 }}>
                Enter
              </Text>
              {/* </TouchableOpacity> */}
            </View>
            <View style={{ flex: 1 }}>

            </View>
          </View>
        </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

  },
  logoView: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',

  },
  formView: {
    flex: 6,
  },
  textInputViewGroup: {
    flex: 2,
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
  textInputView: {
    flexDirection: "row",
    alignItems: 'center',
    borderBottomWidth: 2,
    width: '80%'
  },
  btn: {
    borderRadius: 15,
    backgroundColor: 'lightgrey',
    width: '75%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'grey'
  }
});
