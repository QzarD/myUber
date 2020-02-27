import React, {useEffect, useState, useCallback} from "react";
import {
    View,
    Text,
    StyleSheet,
    PermissionsAndroid,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions, TextInput, Modal, Button
} from "react-native";
import MapView from 'react-native-maps';
import {Ionicons, MaterialIcons} from "@expo/vector-icons";
import Polyline from "@mapbox/polyline";
import {debounce} from "lodash";
import Fire from '../Fire';

const screen = Dimensions.get('window')

const firebase = require("firebase");
require("firebase/firestore");

const RouteMapScreen = ({navigation}) => {
    const mapChooseFromTo = navigation.getParam('mapChooseFromTo')
    const mapChooseTo = navigation.getParam('mapChooseTo')

    const [coordsMyLocation, setCoordsMyLocation] = useState({latitude: null, longitude: null})
    const [coordsFrom, setCoordsFrom] = useState(null);
    const [coordsTo, setCoordsTo] = useState(null);

    const [coords, setCoords] = useState(navigation.getParam('coords'));

    useEffect(() => {
        localeCurrentPosition()
    }, []);

    useEffect(() => {
        setCoords(navigation.getParam('coords'));
            setCoordsFrom(navigation.getParam('coordsFrom'));
            setCoordsTo(navigation.getParam('coordsTo'));
    }, [navigation]);


    const localeCurrentPosition = async () => {
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

    const centerMap = () => {
        localeCurrentPosition().then(r => map.animateToRegion({
            latitude: coordsMyLocation.latitude,
            longitude: coordsMyLocation.longitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.004,
        }))
    }

    if (coordsMyLocation.latitude) {
        return (
            <View style={styles.container}>
                <MapView
                    style={styles.map}
                    showsUserLocation={true}
                    zoomEnabled={true}
                    scrollEnabled={true}
                    showsMyLocationButton={false}
                    initialRegion={coordsFrom}
                    ref={ref => {
                        map = ref;
                    }}
                >
                    {coords &&<MapView.Polyline strokeWidth={2} strokeColor='red' coordinates={coords}/>}
                    {/*<MapView.Marker
                        coordinate={{ "latitude": region.latitude,
                            "longitude": region.longitude }}
                        title={"Your Location"}
                        draggable />*/}
                </MapView>

                <Text style={styles.nameApp}>MyUber</Text>

                <TouchableOpacity style={[styles.myLocationButton, {bottom: '15%'}]}
                                  onPress={() => centerMap()}>
                    <MaterialIcons name="my-location" size={24} color="black"/>
                </TouchableOpacity>

            </View>
        );
    }
    return <View style={styles.containerCenter}>
        <Text>Loading Map...</Text>
        <ActivityIndicator size='large'/>
    </View>


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
    orderButton: {
        position: "absolute",
        top: '6%',
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
    flag: {
        position: "absolute",
        top: (screen.height / 2 - 42),
        left: (screen.width / 2 - 12),
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
    where: {
        position: 'absolute',
        top: '15%',
        width: '100%',
        textAlign: 'center',
    },
    fromTo: {
        fontSize: 14,
        color: '#a7a7a7',
        textAlign: 'center',
        paddingTop: 5
    },
    addressTitle: {
        fontSize: 35,
        color: '#1a1a1a',
        textAlign: 'center',
    },
    addressSubTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#7a7a7a',
        textAlign: 'center',
    },
    whereToButton: {
        position: 'absolute',
        bottom: '5%',
        backgroundColor: 'white',
        height: 45,
        width: '80%',
        left: (screen.width * 0.1),
        borderRadius: 22,
        alignItems: 'center',
        shadowColor: '#000000',
        elevation: 5,
        shadowOpacity: 0.2,
        shadowRadius: 3.5
    },
    whereToButton__wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 9,
    },
    whereToButton__text: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#7a7a7a',
        textAlign: 'center',
    },
    menuMapChooseFromTo: {
        position: 'absolute',
        bottom: 0,
        backgroundColor: 'white',
        width: '98%',
        borderRadius: 8,
        marginHorizontal: '1%',
        marginBottom: 25
    },
    menuMapChooseFromTo_row: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
    },
    menuMapChooseFromTo_ico: {
        width: '11%',
        textAlign: 'center',
    },
    menuMapChooseFromTo_input: {
        fontSize: 16,
        flex: 1
    },
    menuMapChooseFromTo_text: {
        fontSize: 16,
        width: '18%',
        textAlign: 'center',
        color: '#50509f',
        paddingRight:15,
        fontWeight:'bold'
    },
    menuMapChooseFromTo_touch: {
        height: 50,
        backgroundColor: '#ffd625',
        textAlign: 'center',
        flex: 1,
        borderRadius: 7,
        marginHorizontal: '4%',
        marginVertical: 20,
    },
    menuMapChooseFromTo_touch_text: {
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#2d2d2d',
        paddingTop: 14
    },
    transportCard: {
        borderRadius:6,
        padding:4,
        marginHorizontal:4,
        width:screen.width/5,
    },
    transportCard_text: {
        fontSize: 15,
        textAlign: 'center',
        color: '#2d2d2d',
    },
    transportCard_subtext: {
        fontSize: 15,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    back: {
        position: "absolute",
        left: '5%',
        bottom:340,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: '#000000',
        elevation: 4,
        shadowOpacity: 0.4,
        shadowRadius: 3.5
    },
    addInformation:{
        alignItems: "center",
        flex:1,
        marginHorizontal:screen.width/4,
        paddingVertical:8,
        borderRadius:30
    },
    addInformation_text:{
        fontSize:16,
        fontWeight:'bold'
    },
});

RouteMapScreen.navigationOptions = () => ({
    headerShown: false
});

export default RouteMapScreen