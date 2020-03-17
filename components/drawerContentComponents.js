import React,{Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity
} from 'react-native';
import Fire from '../Fire';

export default class drawerContentComponents extends Component {

    _logout = () => {
        Fire.shared.signOut()

    }
    render() {
        return (
            <View style={styles.container2}>

                <TouchableOpacity onPress={() => this.props.navigation.navigate('Client')} >
                    <View style={styles.screenStyle}>
                        {/*<Image style={styles.iconStyle}
                               source={home} />*/}
                        <Text style={styles.screenTextStyle}>Client</Text>
                    </View>
                    <View style={styles.underlineStyle} />
                </TouchableOpacity>


                <TouchableOpacity onPress={() => this.props.navigation.navigate('Driver')} >
                    <View style={styles.screenStyle}>
                        {/*<Image style={styles.iconStyle}
                               source={home} />*/}
                        <Text style={styles.screenTextStyle}>Driver</Text>
                    </View>
                    <View style={styles.underlineStyle} />
                </TouchableOpacity>



                <TouchableOpacity onPress={this._logout} >
                    <View style={styles.screenStyle}>
                        {/*<Image style={styles.iconStyle}
                               source={home} />*/}
                        <Text style={styles.screenTextStyle}>Logout</Text>
                    </View>

                </TouchableOpacity>

            </View>
        )
    }
}

const styles = StyleSheet.create({
    container2:{
        marginTop:30
    },
    screenStyle:{
        marginTop:10,
        marginLeft:10
    },
    screenTextStyle:{
        fontSize:20
    },
    underlineStyle:{

    },
})