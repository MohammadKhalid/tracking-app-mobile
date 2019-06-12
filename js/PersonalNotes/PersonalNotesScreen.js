import React, { Component } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Text,
    View,
    ScrollView,
    AsyncStorage
} from 'react-native';
import NetInfo from '@react-native-community/netinfo'
import Icon from "react-native-vector-icons/Foundation"
import IconM from "react-native-vector-icons/MaterialCommunityIcons"
import moment from 'moment'
import { appMaincolor, getToken } from '../Commons/Constants';
import Spinner from 'react-native-loading-spinner-overlay';
import { DBSelectAllNotes, test, createNotesTable, syncNotes,getNotes } from './DBPersonalNotesFunction';
var jwtDecode = require('jwt-decode');

export default class PersonalNotesScreen extends Component {

    constructor(props) {
        super(props)
        this.state = {
            icon: null,
            notes: [],
            Error: false,
            errorMessage: '',
            spinner: false
        }
    }

    static navigationOptions = {
        tabBarIcon: ({ tintColor }) => (
            <Icon name="clipboard-notes" size={25} style={{ color: tintColor }} />
        )
    }

    componentWillMount() {
        this.willFocusListener = this.props.navigation.addListener('willFocus', () => {
            this.setState({
                spinner: true,
                notes: []
            })
        })
    }

    componentDidMount() {

        this.didFocusListener = this.props.navigation.addListener('didFocus', async () => {
            createNotesTable()
            let is_sync = await AsyncStorage.getItem('sync_notes')
            if (is_sync == null) {
                let token = await getToken()
                let result = await getNotes(jwtDecode(token.token).user.id)
                if(result.code == 200){
                    this.setState({
                        notes: result.data ,
                        Error: false,
                        spinner: false
                    })
                    AsyncStorage.setItem('sync_notes', '0')
                }else if(code == 300){
                    alert("Network Error.")
                }
            } else {
                DBSelectAllNotes()
                    .then(async (response) => {
                        this.setState({
                            notes: response.data,
                            Error: false,
                            spinner: false
                        })
                        let net = await NetInfo.isConnected.fetch()
                        let is_sync = await AsyncStorage.getItem('sync_notes')
                        debugger
                        // AsyncStorage.setItem('sync_notes','1')
                        if (net == true && is_sync == "1") {
                            syncNotes(response.data);
                            AsyncStorage.setItem('sync_notes', '0')
                        }
                    })
                    .catch(error => {
                        this.setState({
                            notes: [],
                            Error: true,
                            errorMessage: error.message,
                            spinner: false
                        })
                    })
            }
        })
    }




    render() {
        let { notes, errorMessage, spinner } = this.state
        return (

            <View style={styles.mainApp}>
                <Spinner
                    visible={spinner}
                    textContent={'Loading...'}
                // textStyle={}
                />
                <View style={styles.Box1}>
                    <Text style={styles.heading}>My Notes</Text>
                </View>

                <View style={styles.Box2}>
                    {
                        (notes.length > 0) ?
                            <ScrollView>
                                {
                                    notes.map((row, ind) => {
                                        return (
                                            <TouchableOpacity onPress={() => this.props.navigation.navigate('viewnotes', { data: row })} key={row.id}>
                                                <NotesList title={row.title} note={row.note} date={row.date} />
                                            </TouchableOpacity>
                                        )
                                    }).reverse()
                                }
                            </ScrollView>
                            :
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <Text>
                                    {errorMessage}
                                </Text>
                            </View>
                    }
                </View>
                <TouchableOpacity onPress={() => this.props.navigation.navigate('addnotes')} style={styles.floatingButton}>
                    <Icon name="plus" size={30} style={{ color: 'white' }} />
                </TouchableOpacity>
            </View>
        );
    }
    onRef = icon => {
        if (!this.state.icon) {
            this.setState({ icon })
        }
    }
}

function NotesList(props) {
    return (
        <View style={styles.Box3}>
            <View style={styles.mainContainer}>
                <Text style={{ color: 'black', fontWeight: "bold", fontSize: 15, }}>{props.title}</Text>
                <Text style={{ fontSize: 15, }}>{props.note}</Text>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Text style={{ fontSize: 15, }}>{(props.date == null || props.date == '') ? null : moment(props.date, 'DD-MM-YYYY HH:mm').format('DD-MM-YYYY hh:mm a')}</Text>
                <IconM name="chevron-right" size={20} />
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    mainApp: {
        flex: 1,
        backgroundColor: appMaincolor
    },
    Box1: {
        flex: 1,
        backgroundColor: appMaincolor,
        justifyContent: 'center',
    },
    heading: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 25,
        marginLeft: 20,
    },
    Box2: {
        flex: 6,
        backgroundColor: 'white',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        padding: 10,
    },
    Box3: {
        marginHorizontal: 10,
        marginVertical: 10,
        height: 110,
        // borderBottomColor: 'lightgrey',
        // borderBottomWidth: 0.5
    },
    mainContainer: {
        flex: 2,
        justifyContent: 'space-between',
    },
    floatingButton: {
        position: 'absolute',
        backgroundColor: appMaincolor,
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        right: 15,
        bottom: 15,
    }
})