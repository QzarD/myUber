import React, {useState, useCallback, useEffect} from 'react';
import {StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Dimensions} from 'react-native';
import {Ionicons, MaterialIcons} from "@expo/vector-icons";
import {debounce} from "lodash";
import ResultCard from "../components/ResultCard";
import MapView from "react-native-maps";
import Fire from "../Fire";

const screen = Dimensions.get('window')

function DriverScreen({navigation}) {

    const [coordsMyLocation, setCoordsMyLocation] = useState({latitude: null, longitude: null})
    const [coords, setCoords] = useState(null);
    console.log(coords)

    useEffect(() => {
        localeCurrentPosition();
        Fire.shared.getOrder(setCoords);
        console.log('done')
    }, []);

    const localeCurrentPosition = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoordsMyLocation({latitude: position.coords.latitude, longitude: position.coords.longitude});
            },
            (error) => {
                // See error code charts below.
                console.log(error.code, error.message);
            },
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000}
        );
    }

    const centerMap = async () => {
        await localeCurrentPosition();
        map.animateToRegion({
            latitude: coordsMyLocation.latitude,
            longitude: coordsMyLocation.longitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.004,
        });
    }

    return (
        <View style={styles.container}>

            <TouchableOpacity style={styles.menuButton} onPress={() => {navigation.openDrawer()
            }}>
                <Ionicons name="ios-menu" size={32} color="black"/>
            </TouchableOpacity>

            <Text style={styles.nameApp}>MyUber (Driver)</Text>

        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    map: {
        flex: 1
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
    myLocationButton: {
        position: "absolute",
        right: '5%',
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
    nameApp: {
        position: 'absolute',
        fontSize: 20,
        color: '#7a7a7a',
        top: 35,
        width: 200,
        left: (screen.width / 2 - 100),
        textAlign: 'center',
    },
});

DriverScreen.navigationOptions = () => ({
    headerShown: false
});

export default DriverScreen