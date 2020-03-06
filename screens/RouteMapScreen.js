import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions, TextInput, Alert, Button, Linking
} from "react-native";
import MapView from 'react-native-maps';
import {Ionicons, MaterialIcons} from "@expo/vector-icons";
import Fire from '../Fire';
import Polyline from "@mapbox/polyline";

const {width, height} = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0043;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

/*const firebase = require("firebase");
require("firebase/firestore");*/

const RouteMapScreen = ({navigation}) => {
    const isAgree = navigation.getParam('isAgree')
    const idOrder = navigation.getParam('idOrder')
    const client = navigation.getParam('client')

    const [coordsMyLocation, setCoordsMyLocation] = useState({
        latitude: null,
        longitude: null,
        latitudeDelta: null,
        longitudeDelta: null
    })
    const [coordsFrom, setCoordsFrom] = useState(null);
    const [coordsTo, setCoordsTo] = useState(null);
    const [coords, setCoords] = useState(navigation.getParam('coords'));
    const [coordsDriver, setCoordsDriver] = useState(null);
    const [distance, setDistance] = useState(null);
    const [duration, setDuration] = useState(null);
    const [driver, setDriver] = useState({
        avatar:null,
        email:null,
        name:null,
        nameCar:null,
        numberCar:null,
        phoneNumber:null,
    });
    const [questionBlank, setQuestionBlank] = useState(false);
    const [isTakeOpenOrder, setIsTakeOpenOrder] = useState(false);

    useEffect(() => {
        localeCurrentPosition()
    }, []);

    useEffect(() => {
        setCoords(navigation.getParam('coords'));
        setCoordsFrom(navigation.getParam('coordsFrom'));
        setCoordsTo(navigation.getParam('coordsTo'));
        setDriver(navigation.getParam('driver'));
    }, [navigation]);

    function createMarker({latitude, longitude}) {
        return {
            latitude: latitude,
            longitude: longitude,
        };
    }

    const fitPadding = (marker1, marker2) => {
        const MARKERS = [
            createMarker(marker1 ? marker1 : navigation.getParam('coordsFrom')),
            createMarker(marker2 ? marker2 : navigation.getParam('coordsTo')),
        ];
        this.map.fitToCoordinates([MARKERS[0], MARKERS[1]], {
            edgePadding: {top: 200, right: 200, bottom: 200, left: 200},
            animated: true,
        });
    }

    const localeCurrentPosition = async () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoordsMyLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    latitudeDelta: 0.001,
                    longitudeDelta: 0.004,
                });
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

    const getDirections = (coordsMyLocation, coordsFrom) => {
        let latFrom = coordsMyLocation.latitude;
        let lonFrom = coordsMyLocation.longitude;
        let latTo = coordsFrom.latitude;
        let lonTo = coordsFrom.longitude;
        fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${latFrom},${
            lonFrom}&destination=${latTo},${lonTo}&key=AIzaSyAxDMt-Yh3pq8AIVDV7EtniQ9HHEFricS8`)
            .then((response) => response.json())
            .then((responseJson) => {
                const points = Polyline.decode(responseJson.routes[0].overview_polyline.points);
                const coords = points.map(point => {
                    return {
                        latitude: point[0], longitude: point[1]
                    }
                })
                setCoordsDriver(coords)
                setDistance(responseJson.routes[0].legs[0].distance.text)
                setDuration(responseJson.routes[0].legs[0].duration.text)
                fitPadding(coordsMyLocation, coordsFrom)
                setQuestionBlank(true)
            });
    }

    const takeOpenOrder = () => {
        let idDriver=Fire.shared.uid;
        let col = Fire.shared.firestore.collection("orders")
        col.doc(idOrder)
            .get()
            .then(snapshot => {
                let doc = snapshot.data();
                if (doc.completeOrder === false && doc.openOrder === true) {
                    col.doc(idOrder)
                        .update({
                            openOrder: false,
                            driver: {
                                uid:idDriver,
                                avatar:driver.avatar,
                                email:driver.email,
                                name:driver.name,
                                nameCar:driver.nameCar,
                                numberCar:driver.numberCar,
                                phoneNumber:driver.phoneNumber,
                                duration: duration
                            }
                        })
                        .then(() => {
                            setQuestionBlank(false)
                            setIsTakeOpenOrder(true)
                            console.log('Order update')
                        })
                } else {
                    Alert.alert(
                        'Error',
                        'Sorry, no more order',
                        [
                            {
                                text: 'Cancel', onPress: () => {
                                }, style: 'cancel'
                            },
                            {
                                text: 'OK', onPress: () => {
                                    setQuestionBlank(false)
                                    navigation.navigate('HomeDriver', {lastUpdate: new Date()})
                                }
                            },
                        ],
                        {cancelable: false}
                    )
                }
            })
            .catch(err => {
                console.log('Error getting documents', err);
            });
    }

    const finishTrip = () => {
        Fire.shared.firestore.collection("orders").doc(idOrder)
            .update({
                completeOrder: true
            })
            .then(() => {
                navigation.navigate('HomeDriver', {lastUpdate: new Date()})
            })
    }

    const distanceRound=(distance, rate, min)=>{
        let x=Math.round(distance/rate);
        if (x<10){
            return  `${min}$`
        } else {return `${x}$`}
    }

    const rateCar=()=>{
        let transportCardChoice=client.transportCardChoice
        if (transportCardChoice===2){
            return 90
        }
        if (transportCardChoice===3){
            return 70
        }
        if (transportCardChoice===4){
            return 40
        } else {
            return 100
        }
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
                    initialRegion={coordsMyLocation}
                    onMapReady={()=>{
                        isAgree ? getDirections(coordsMyLocation, coordsFrom) : fitPadding()
                    }}
                    ref={ref => {
                        map = ref;
                    }}
                >
                    {coordsFrom &&
                    <MapView.Marker coordinate={{latitude: coordsFrom.latitude, longitude: coordsFrom.longitude}}
                                    onPress={() => map.animateToRegion({
                                        latitude: coordsFrom.latitude,
                                        longitude: coordsFrom.longitude,
                                        latitudeDelta: 0.001,
                                        longitudeDelta: 0.004,
                                    })} title={`${navigation.getParam('name')}`}>
                        <Ionicons name="ios-person" size={35} color="red"/>
                    </MapView.Marker>
                    }
                    {coords && <MapView.Polyline strokeWidth={2} strokeColor='red' coordinates={coords}/>}
                    {coordsDriver && <MapView.Polyline strokeWidth={2} strokeColor='green' coordinates={coordsDriver}/>}
                </MapView>

                <Text style={styles.nameApp}>MyUber</Text>

                <TouchableOpacity style={[styles.myLocationButton, {bottom: isTakeOpenOrder ? '40%' : '25%'}]}
                                  onPress={() => fitPadding()}>
                    <Ionicons name="ios-globe" size={24} color="green"/>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.myLocationButton, {bottom: isTakeOpenOrder ? '30%' : '15%'}]}
                                  onPress={() => centerMap()}>
                    <MaterialIcons name="my-location" size={24} color="black"/>
                </TouchableOpacity>

                {!questionBlank && !isTakeOpenOrder &&
                <>
                    <TouchableOpacity style={[styles.back, {bottom: '35%'}]} onPress={() => {
                        getDirections(coordsMyLocation, coordsFrom)
                    }}>
                        <Ionicons name="ios-checkmark" size={45} color="black"/>
                    </TouchableOpacity>
                    < TouchableOpacity style={[styles.back, {bottom: '15%'}]} onPress={() => navigation.goBack()}>
                        <Ionicons name="ios-undo" size={30} color="#FF536A"/>
                    </TouchableOpacity>
                </>
                }
                {distance && !isTakeOpenOrder &&
                <View style={styles.distance}>
                    <Text style={styles.distance_text}>{distance}</Text>
                </View>
                }
                {questionBlank &&
                <View style={styles.questionBlank}>
                    <Text style={styles.questionBlank_title}>Are you sure?</Text>
                    <TouchableOpacity style={[styles.questionBlank_button, {backgroundColor: '#8cfb8b'}]}
                                      onPress={() => takeOpenOrder()}>
                        <Text style={styles.questionBlank_button_text}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.questionBlank_button, {backgroundColor: '#fb5d58'}]}
                                      onPress={() => {
                                          setQuestionBlank(false)
                                          navigation.goBack()
                                      }}>
                        <Text style={styles.questionBlank_button_text}>No</Text>
                    </TouchableOpacity>
                </View>
                }
                {isTakeOpenOrder &&
                <View style={styles.isTakeOpenOrder}>
                    <Text>Client: {client.user.name}</Text>
                    <Text>Address From: {client.addressFromInput}</Text>
                    <Text> $</Text>
                    {client.addInfo && <Text>Add Info: {client.addInfo}</Text>}
                    <View style={styles.isTakeOpenOrder_row}>
                        <TouchableOpacity style={styles.isTakeOpenOrder_button}
                                          onPress={() => Linking.openURL(`tel:${client.user.phoneNumber}`)}>
                            <Ionicons style={styles.isTakeOpenOrder_ico} name="ios-call" size={45} color="green"/>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.isTakeOpenOrder_button}>
                            <Ionicons style={styles.isTakeOpenOrder_ico} name="ios-chatbubbles" size={45}
                                      color="#fb5d58"/>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.isTakeOpenOrder_row_blackButtons}>
                        <TouchableOpacity style={styles.isTakeOpenOrder_row_blackButton}
                                          onPress={() => setCoordsDriver(null)}>
                            <Text style={styles.isTakeOpenOrder_row_blackButton_text}>I came</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.isTakeOpenOrder_row_blackButton}>
                            <Text style={styles.isTakeOpenOrder_row_blackButton_text}>Picked up</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.isTakeOpenOrder_row_blackButton}
                                          onPress={() => finishTrip()}>
                            <Text style={styles.isTakeOpenOrder_row_blackButton_text}>Finish the trip</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                }

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
        top: (height / 2 - 42),
        left: (width / 2 - 12),
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
        left: (width / 2 - 100),
        textAlign: 'center',
    },
    back: {
        position: "absolute",
        left: '5%',
        bottom: 340,
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
    distance: {
        position: "absolute",
        width: 200,
        left: (width / 2 - 100),
        top: '40%',
        alignItems: "center",
    },
    distance_text: {
        fontSize: 25
    },
    questionBlank: {
        position: 'absolute',
        bottom: 0,
        backgroundColor: 'white',
        width: '60%',
        borderRadius: 20,
        marginHorizontal: '20%',
        marginBottom: '20%'
    },
    questionBlank_title: {
        height: 20,
        textAlign: 'center'
    },
    questionBlank_button: {
        height: 60,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        marginTop: 12
    },
    questionBlank_button_text: {},
    isTakeOpenOrder: {
        position: 'absolute',
        bottom: '5%',
        backgroundColor: '#f5f5f5',
        width: '80%',
        borderRadius: 20,
        marginHorizontal: '10%',
        padding: 10
    },
    isTakeOpenOrder_row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: '18%'
    },
    isTakeOpenOrder_button: {
        backgroundColor: 'white',
        height: 60,
        width: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: "center",
    },
    isTakeOpenOrder_ico: {},
    isTakeOpenOrder_row_blackButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 30,
        marginTop: 20
    },
    isTakeOpenOrder_row_blackButton: {
        backgroundColor: '#565656',
        paddingHorizontal: 7,
        borderRadius: 5,
        justifyContent: 'center',
    },
    isTakeOpenOrder_row_blackButton_text: {
        color: 'white',
    },
});

RouteMapScreen.navigationOptions = () => ({
    headerShown: false
});

export default RouteMapScreen