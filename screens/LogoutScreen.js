import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import Fire from '../Fire';


const LogoutScreen = ({navigation}) => {

    return (
            <View style={styles.containerCenter}>
                <TouchableOpacity style={styles.menuButton} onPress={() => {navigation.openDrawer()
                }}>
                    <Ionicons name="ios-menu" size={32} color="black"/>
                </TouchableOpacity>
                <Text>Are you sure?</Text>
                <TouchableOpacity style={[styles.button,{backgroundColor:'green'}]} onPress={() => {Fire.shared.signOut()
                }}>
                    <Text style={styles.button_text}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button,{backgroundColor:'red'}]} onPress={() => {navigation.navigate("Home")
                }}>
                    <Text style={styles.button_text}>No</Text>
                </TouchableOpacity>
            </View>
        );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    containerCenter: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    menuButton: {
        position: "absolute",
        top: '7%',
        left: '5%',
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
    },
    button:{
        height:50,
        width:200,
        borderRadius:10,
        marginTop:30,
        justifyContent:'center',
        alignItems:'center'
    },
    button_text:{
        color:'white'
    }
});

LogoutScreen.navigationOptions = () => ({
    headerShown: false
});

export default LogoutScreen