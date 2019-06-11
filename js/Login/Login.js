import React, { Component } from 'react';
import {
  TextInput,
  StyleSheet,
  Text,
  View,
  Image,
  ToastAndroid,
  AsyncStorage,
  ImageBackground,
} from 'react-native';

import { login } from "./LoginActions"
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Spinner from 'react-native-loading-spinner-overlay';

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
  submit = async () => {
    let { email, password } = this.state
    this.setState({
      spinner: true
    })
    let loginResult = await login(email, password)
    if (loginResult.code == 200) {
      this.setState({
        spinner: false
      })
      ToastAndroid.showWithGravityAndOffset(
        loginResult.message,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
        25,
        50
      );
      this.props.navigation.navigate('attendance')
    } else {
      this.setState({
        spinner: false
      })
      ToastAndroid.showWithGravityAndOffset(
        loginResult.message,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
        25,
        50
      );
    }
  }

  render() {
    return (
      <ImageBackground source={require('../../assets/images/whole-back.jpg')} style={styles.container}>
        <Spinner
          visible={this.state.spinner}
          textContent={'Loading...'}
        />
        <View style={styles.logoView}>
          <Image source={require('../../assets/images/tazza-logo.png')} />
        </View>
        <View style={styles.formView}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Image source={require('../../assets/images/sign-in-logo.png')} />
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
            <Text onPress={this.submit} style={{ fontSize: 30 }}>
              Enter
            </Text>
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
