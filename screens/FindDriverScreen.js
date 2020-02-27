import React, {useState, useCallback, useEffect} from 'react';
import {StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Dimensions} from 'react-native';
import {Ionicons, MaterialIcons} from "@expo/vector-icons";
import {debounce} from "lodash";
import ResultCard from "../components/ResultCard";
import MapView from "react-native-maps";
import Fire from "../Fire";

const screen = Dimensions.get('window')

function FindDriverScreen({navigation}) {
    const id=navigation.getParam('id');
    const distance=navigation.getParam('distance');
    const coords=navigation.getParam('coords');
    const addressFromInput=navigation.getParam('addressFromInput');
    const coordsFrom=navigation.getParam('coordsFrom');
    const addressToInput=navigation.getParam('addressToInput');
    const coordsTo=navigation.getParam('coordsTo');
    const addInfo=navigation.getParam('addInfo');
    const [openOrder, setOpenOrder]=useState(true);
    const [completeOrder, setCompleteOrder]=useState(false);

    const [region, setRegion] = useState({
        latitude: 100,
        longitude: 20,
        latitudeDelta: 1,
        longitudeDelta: 1
    })
    const [coordsMyLocation, setCoordsMyLocation] = useState({latitude: null, longitude: null})

    useEffect(() => {
        localeCurrentPosition()
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

    const deleteOrder=()=>{
        Fire.shared.deleteOrder({id:navigation.getParam('id')})
            .then(ref=>{
                navigation.navigate('MapChooseFromTo')
            })
            .catch(err=>{
                alert(err)
            })
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                showsUserLocation={true}
                zoomEnabled={true}
                scrollEnabled={true}
                showsMyLocationButton={false}
                initialRegion={navigation.getParam('coordsFrom')}
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

            <TouchableOpacity style={styles.menuButton} onPress={() => {navigation.openDrawer()
            }}>
                <Ionicons name="ios-menu" size={32} color="black"/>
            </TouchableOpacity>

            <Text style={styles.nameApp}>MyUber</Text>

            <TouchableOpacity style={[styles.myLocationButton, {bottom: 200}]}
                              onPress={() => centerMap()}>
                <MaterialIcons name="my-location" size={24} color="black"/>
            </TouchableOpacity>

            <View style={styles.findCar}>
                <Text style={styles.findCar_text}>Car search...</Text>
                <TouchableOpacity onPress={()=>deleteOrder()}  style={styles.findCar_cancel}>
                    <Ionicons name="ios-close-circle-outline" size={30} color="black"/>
                    <Text  style={styles.findCar_cancel_text}>Cancel</Text>
                </TouchableOpacity>
            </View>
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
    findCar: {
        position: 'absolute',
        bottom: 0,
        backgroundColor: 'white',
        width: '98%',
        borderRadius: 8,
        marginHorizontal: '1%',
        marginBottom: 25,
        paddingHorizontal:35,
        paddingVertical:25
    },
    findCar_text: {
        fontSize: 25,
        marginBottom: 30
    },
    findCar_cancel: {
        flexDirection:'row',
        height:40,
        alignItems: "center"
    },
    findCar_cancel_text: {
        alignItems: "center",
        marginLeft:15
    },
});

FindDriverScreen.navigationOptions = () => ({
    headerShown: false
});

export default FindDriverScreen