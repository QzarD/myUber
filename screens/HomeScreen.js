import React, {useEffect, useState} from "react";
import {View, Text, StyleSheet, PermissionsAndroid, ActivityIndicator, TouchableOpacity, Dimensions} from "react-native";
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import {Ionicons, MaterialIcons} from "@expo/vector-icons";

const widthTel=Dimensions.get('window').width

const HomeScreen = () => {
    const [coords, setCoords] = useState({latitude: null, longitude: null})


    const localeCurrentPosition = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({latitude: position.coords.latitude, longitude: position.coords.longitude});
                console.log("latitude: ",position.coords.latitude, "longitude: ",position.coords.longitude)
            },
            (error) => {
                // See error code charts below.
                console.log(error.code, error.message);
            },
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000}
        );
    }

    useEffect(() => {
        localeCurrentPosition()
    }, []);

    const centerMap=()=>{
        map.animateToRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.004,
        })
    }

    if(coords.latitude){
        return (
            <View style={styles.container}>
                <MapView
                    style={styles.map}
                    showsUserLocation={true}
                    zoomEnabled={true}
                    showsMyLocationButton={false}
                    ref={map=>{map=map}}
                    initialRegion={{
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                        latitudeDelta: 0.001,
                        longitudeDelta: 0.004,
                    }}

                />
                <TouchableOpacity style={styles.menuButton} onPress={() => {}}>
                    <Ionicons name="ios-menu" size={32} color="black"/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.orderButton} onPress={() => {}}>
                    <Ionicons name="md-arrow-forward" size={24} color="black"/>
                </TouchableOpacity>
                <Text style={styles.nameApp}>MyUber</Text>
                <TouchableOpacity style={styles.myLocationButton} onPress={() => {centerMap()}}>
                    <MaterialIcons name="my-location" size={24} color="black"/>
                </TouchableOpacity>
            </View>
        );
    }
    return <View style={styles.container}>
        <ActivityIndicator size='large'/>
    </View>


};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    map: {
        flex: 1
    },
    menuButton: {
        position: "absolute",
        top: 48,
        left: 20,
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 5
    },
    orderButton: {
        position: "absolute",
        top: 42,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 5,
        shadowColor: '#000000',
        elevation: 4,
        shadowOpacity: 0.4,
        shadowRadius: 3.5
    },
    myLocationButton: {
        position: "absolute",
        bottom: 100,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 5,
        shadowColor: '#000000',
        elevation: 4,
        shadowOpacity: 0.4,
        shadowRadius: 3.5
    },
    nameApp:{
        position: 'absolute',
        fontSize:20,
        color: '#7a7a7a',
        top:35,
        width:200,
        left:(widthTel/2 -100),
        textAlign: 'center',
    }
});

HomeScreen.navigationOptions =()=> ({
    headerShown: false
});

export default HomeScreen