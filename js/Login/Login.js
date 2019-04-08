import React, {Component} from 'react';
import {
  TextInput, 
  StyleSheet, 
  TouchableOpacity,
  Text, 
  View,
  Image,
  ToastAndroid,
  AsyncStorage
} from 'react-native';

import { login} from "./LoginActions"
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
  async componentWillMount(){
    
  let token = await AsyncStorage.getItem('token')
    if(token !== null){
      this.props.navigation.navigate('attendance')
    }
  }
  submit = () =>{
      let {email, password} = this.state
      this.setState({
        spinner: true
      })
      login(email,password)
      .then(response =>{
        let {err,code,message} = response
        if(code == 500){
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
        }else{
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
      .catch(error=>{
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
  }

  render() {
    return (
      <View style={styles.container}>
        <Spinner
          visible={this.state.spinner}
          textContent={'Loading...'}
          // textStyle={}
        />
        <View style={styles.logoView}>
            <Image source={require('../../assets/images/mmc-logo.png')}/> 
        </View>
        <View style={styles.formView}>
            <View style={[styles.textInputViewGroup]}>
                <View style={styles.textInputView}>
                <Icon name="email" size={25}/>
                <TextInput
                    onChangeText ={(text)=>{this.setState({email: text})}}
                    style={{width: '100%'}}
                    placeholder='Email'
                />
                </View>
                <View style={styles.textInputView}>
                <Icon name="lock-outline"  size={25}/>
                <TextInput
                    onChangeText ={(text)=>{this.setState({password: text})}}
                    style={{width: '100%'}}
                    placeholder='Password'
                    secureTextEntry={true}
                />
                </View>
                <TouchableOpacity onPress={this.submit} style={styles.btn}>
                    <Text style={{fontSize: 20}}>
                        Login
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={{flex: 1}}>
            
            </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex : 1,
  },
  logoView: {
        flex: 3,
        justifyContent: 'center',
        alignItems: 'center'
    },
  formView: {
      flex: 4,
  },
  textInputViewGroup:{
      flex: 2,
      justifyContent: 'space-between',
      alignItems: 'center'
  },
  textInputView:{
    flexDirection: "row",
    alignItems: 'center',
    borderBottomWidth: 2,
    width: '80%'
  },
  btn:{
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
