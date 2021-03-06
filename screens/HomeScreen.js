import React, {useEffect, useState, useCallback} from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions, TextInput
} from "react-native";
import MapView from 'react-native-maps';
import {Ionicons, MaterialIcons} from "@expo/vector-icons";
import Polyline from "@mapbox/polyline";
import {debounce} from "lodash";
import Fire from '../Fire';
import {directionsKey, geocodeKey} from "../keys";

const screen = Dimensions.get('window')
/*
const firebase = require("firebase");
require("firebase/firestore");*/

const HomeScreen = ({navigation}) => {
    const mapChooseFromTo = navigation.getParam('mapChooseFromTo')
    const mapChooseTo = navigation.getParam('mapChooseTo')

    const [coordsMyLocation, setCoordsMyLocation] = useState({latitude: null, longitude: null})
    const [regionChangeProgress, setRegionChangeProgress] = useState(true)
    const [regionLocationAddress, setRegionLocationAddress] = useState('')
    const [region, setRegion] = useState({
        latitude: 100,
        longitude: 20,
        latitudeDelta: 1,
        longitudeDelta: 1
    })

    const [addressFromInput, setAddressFromInput] = useState('');
    const [addressToInput, setAddressToInput] = useState('');
    const [onFocusFrom, setOnFocusFrom] = useState(true);
    const [coordsFrom, setCoordsFrom] = useState(null);
    const [coordsTo, setCoordsTo] = useState(null);

    const [coords, setCoords] = useState(null);
    const [distance, setDistance] = useState(null);
    const [completedRoute, setCompletedRoute] = useState(false);
    const [getDirectionsButtonDisabled, setGetDirectionsButtonDisabled] = useState(false);
    const [transportCardChoice, setTransportCardChoice] = useState(1);
    const [showModalAddInfo, setShowModalAddInfo] = useState(false);
    const [addInfo, setAddInfo] = useState('');

    useEffect(() => {
        localeCurrentPosition();
    }, []);

    useEffect(() => {
        if (mapChooseFromTo) {
            setAddressFromInput(navigation.getParam('addressFromInput'));
            setRegionLocationAddress(navigation.getParam('coordsFrom'));
            setCoordsMyLocation(navigation.getParam('coordsMyLocation'));
            setAddressToInput(navigation.getParam('addressToInput'));
            setCoordsFrom(navigation.getParam('coordsFrom'));
            setCoordsTo(navigation.getParam('coordsTo'));
        }
        if (mapChooseFromTo && !mapChooseTo){
            setRegion(navigation.getParam('coordsFrom'));
        }
        if (mapChooseFromTo && mapChooseTo){
            if (navigation.getParam('coordsTo')===undefined){
                setRegion(navigation.getParam('coordsFrom'))
            } else {
                setRegion(navigation.getParam('coordsTo'))
            }
        }
    }, [navigation]);


    const localeCurrentPosition = async () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoordsMyLocation({latitude: position.coords.latitude, longitude: position.coords.longitude});
                if (!mapChooseFromTo) {
                    setRegion({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        latitudeDelta: 0.001,
                        longitudeDelta: 0.004,
                    });
                }
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

    function createMarker({latitude,longitude}) {
        return {
            latitude: latitude,
            longitude: longitude,
        };
    }
    const MARKERS = [
        createMarker(coordsFrom || {}),
        createMarker(coordsTo || {}),
    ];
    const fitPadding=()=> {
        this.map.fitToCoordinates([MARKERS[0], MARKERS[1]], {
            edgePadding: { top: 150, right: 150, bottom: screen.height/1.4+150, left: 150 },
            animated: true,
        });
    }

    const fetchAddress = (lat, lon) => {
        setRegionChangeProgress(true)
        fetch(geocodeKey(lat, lon))
            .then((response) => response.json())
            .then((responseJson) => {
                if (mapChooseFromTo && !mapChooseTo) {
                    setAddressFromInput(responseJson.results[0].formatted_address.split(',', 2).join(','))
                } else {
                    setAddressToInput(responseJson.results[0].formatted_address.split(',', 2).join(','))
                }
                setRegionLocationAddress(responseJson.results[0].formatted_address);
                setRegionChangeProgress(false);
            });
        setRegionChangeProgress(false);
    }

    const waitFetchAddress = useCallback(debounce((lat, lon) => {
        fetchAddress(lat, lon);
    }, 1000), []);

    const onRegionChange = (data) => {
        setRegion(data);
        if (mapChooseFromTo && !mapChooseTo) {
            setCoordsFrom(data)
        } else {
            setCoordsTo(data)
        }
        waitFetchAddress(data.latitude, data.longitude)
    }

    const distanceRound=(distance, rate, min)=>{
        let x=Math.round(distance/rate);
        if (x<min){
            return  `min ${min}$`
        } else {return `min ${x}$`}
    }

    const getDirections=(coordsFrom, coordsTo)=>{
        let latFrom=coordsFrom.latitude;
        let lonFrom=coordsFrom.longitude;
        let latTo=coordsTo.latitude;
        let lonTo=coordsTo.longitude;
        setGetDirectionsButtonDisabled(true)
        fetch(directionsKey(latFrom,lonFrom,latTo,lonTo))
            .then((response) => response.json())
            .then((responseJson) => {
                const points=Polyline.decode(responseJson.routes[0].overview_polyline.points);
                const coords=points.map(point=>{
                    return {
                        latitude:point[0], longitude:point[1]
                    }
                })
                setCoords(coords)
                setDistance(responseJson.routes[0].legs[0].distance.value)
                setCompletedRoute(true)
                setGetDirectionsButtonDisabled(false)
                fitPadding()
            });
    }

    const hendleOrder=()=>{
        Fire.shared.addOrder({
            transportCardChoice:transportCardChoice,
            distance:distance,
            coords:coords,
            addressFromInput:addressFromInput,
            coordsFrom:coordsFrom,
            addressToInput:addressToInput,
            coordsTo:coordsTo,
            addInfo:addInfo,
            openOrder:true,
            completeOrder:false,
            driverWaiting:false,
        })
            .then(ref=>{
                navigation.navigate('FindDriver', {
                    id:ref.id,
                    coords:coords,
                    coordsFrom:coordsFrom,
                    distance:distance,
                    transportCardChoice:transportCardChoice,
                })
            })
            .catch(err=>{
                alert(err)
            })
    }

    if (coordsMyLocation.latitude) {
        return (
            <View style={styles.container}>
                <MapView
                    style={[styles.map]}
                    showsUserLocation={true}
                    zoomEnabled={true}
                    scrollEnabled={true}
                    showsMyLocationButton={false}
                    initialRegion={region}
                    onRegionChangeComplete={completedRoute ? null : onRegionChange}
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

                {!completedRoute &&
                <Ionicons style={styles.flag} name="ios-pin" size={46}
                          color={(mapChooseFromTo && mapChooseTo) ? "#575757" : "#FF536A"}/>
                }

                <TouchableOpacity style={[styles.myLocationButton, {bottom: mapChooseFromTo ? (completedRoute ? 340 : 230) : '15%'}]}
                                  onPress={() => centerMap()}>
                    <MaterialIcons name="my-location" size={24} color="black"/>
                </TouchableOpacity>

                {completedRoute &&
                    <TouchableOpacity style={styles.back} onPress={() => setCompletedRoute(false)}>
                        <Ionicons name="ios-undo" size={30} color="#FF536A"/>
                    </TouchableOpacity>
                }

                {mapChooseFromTo
                    ?
                    <View style={styles.menuMapChooseFromTo}>
                        <View style={styles.menuMapChooseFromTo_row}>
                            <Ionicons style={styles.menuMapChooseFromTo_ico}
                                      name={(mapChooseFromTo && !mapChooseTo) ? "ios-pin" : "ios-radio-button-off"}
                                      size={(mapChooseFromTo && !mapChooseTo) ? 22 : 16} color="#FF536A"/>
                            {(mapChooseFromTo && mapChooseTo) ? <TextInput
                                    style={[styles.menuMapChooseFromTo_input, {color: '#A3A4A2'}]}
                                    placeholder='Where from?'
                                    onChangeText={text => {
                                        setAddressFromInput(text);
                                    }}
                                    editable={false}
                                    value={addressFromInput}/>
                                :
                                <TouchableOpacity onPress={() => {
                                    navigation.navigate('Where', {
                                        addressFrom: addressFromInput, coordsMyLocation: coordsMyLocation,
                                        coordsFrom: coordsFrom, addressTo: addressToInput,
                                        coordsTo: coordsTo
                                    })
                                }}>
                                    <TextInput
                                        style={[styles.menuMapChooseFromTo_input, (coordsFrom || onFocusFrom) ? null : {color: '#FF536A'}]}
                                        placeholder='Where from?'
                                        onChangeText={text => {
                                            setAddressFromInput(text);
                                        }}
                                        editable={false}
                                        value={addressFromInput}/>
                                </TouchableOpacity>
                            }
                        </View>
                        <View style={styles.menuMapChooseFromTo_row}>
                            <Ionicons style={styles.menuMapChooseFromTo_ico}
                                      name={(mapChooseFromTo && !mapChooseTo) ? "ios-radio-button-off" : "ios-pin"}
                                      size={(mapChooseFromTo && !mapChooseTo) ? 16 : 22} color="#575757"/>
                            {(mapChooseFromTo && !mapChooseTo) ? <TextInput
                                    style={[styles.menuMapChooseFromTo_input, {color: '#A3A4A2'}]}
                                    placeholder='Where to?'
                                    onChangeText={text => {
                                        setAddressToInput(text);
                                    }}
                                    editable={false}
                                    value={addressToInput}/>
                                :
                                <TouchableOpacity style={{flex:1}} onPress={() => {
                                    navigation.navigate('Where', {
                                        addressFrom: addressFromInput, coordsMyLocation: coordsMyLocation,
                                        coordsFrom: coordsFrom, addressTo: addressToInput,
                                        coordsTo: coordsTo
                                    })
                                }}>
                                    <TextInput
                                        style={[styles.menuMapChooseFromTo_input, (coordsFrom || onFocusFrom) ? null : {color: '#575757'}]}
                                        placeholder='Where to?'
                                        onChangeText={text => {
                                            setAddressToInput(text);
                                        }}
                                        editable={false}
                                        value={addressToInput}/>
                                </TouchableOpacity>
                            }
                            {completedRoute &&
                                <Text style={styles.menuMapChooseFromTo_text}>{distanceRound(distance, 100, 10)}</Text>
                            }
                        </View>
                        {completedRoute && <>
                            <View style={styles.menuMapChooseFromTo_row}>
                                <TouchableOpacity style={[styles.transportCard, transportCardChoice===1 && {flex:1,
                                    backgroundColor: '#f0f0f0'}]}
                                onPress={()=>setTransportCardChoice(1)}>
                                    <Text style={styles.transportCard_text}>Eco</Text>
                                    <Text style={styles.transportCard_subtext}>{distanceRound(distance, 100, 10)}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.transportCard, transportCardChoice===2 && {flex:2,
                                    backgroundColor: '#f0f0f0'}]}
                                                  onPress={()=>setTransportCardChoice(2)}>
                                    <Text style={styles.transportCard_text}>Comfort</Text>
                                    <Text style={styles.transportCard_subtext}>{distanceRound(distance, 90, 15)}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.transportCard, transportCardChoice===3 && {flex:3,
                                    backgroundColor: '#f0f0f0'}]}
                                                  onPress={()=>setTransportCardChoice(3)}>
                                    <Text style={styles.transportCard_text}>Business</Text>
                                    <Text style={styles.transportCard_subtext}>{distanceRound(distance, 70, 20)}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.transportCard, transportCardChoice===4 && {flex:4,
                                    backgroundColor: '#f0f0f0'}]}
                                                  onPress={()=>setTransportCardChoice(4)}>
                                    <Text style={styles.transportCard_text}>Truck</Text>
                                    <Text style={styles.transportCard_subtext}>{distanceRound(distance, 40, 30)}</Text>
                                </TouchableOpacity>
                            </View>
                            {showModalAddInfo
                                ? <View style={[styles.menuMapChooseFromTo_row, {marginHorizontal:20}]}>
                                    <TextInput style={{flex:1}} placeholder='Add info'
                                        onChangeText={text => {
                                            setAddInfo(text);
                                        }}
                                        value={addInfo}
                                        autoFocus={true}
                                    />
                                    <TouchableOpacity onPress={()=>setShowModalAddInfo(false)}>
                                        <Ionicons name="ios-add" size={32} color="black"/>
                                    </TouchableOpacity>
                                </View>
                                : <View style={styles.menuMapChooseFromTo_row}>
                                    <TouchableOpacity style={[styles.addInformation,
                                        addInfo.length>0 ? {backgroundColor:'#c0fbbf'} : {backgroundColor:'#d2dafb'}]}
                                                      onPress={() => setShowModalAddInfo(true)}>
                                        <Text style={styles.addInformation_text}>{addInfo.length>0 ? 'Edit' : 'Add'} information</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                            </>
                        }
                        {(coordsFrom && coordsTo) ?
                            <View style={styles.menuMapChooseFromTo_row}>
                                {getDirectionsButtonDisabled
                                    ? <View style={styles.menuMapChooseFromTo_touch}>
                                        <Text style={styles.menuMapChooseFromTo_touch_text}>OK</Text>
                                    </View>
                                    : <TouchableOpacity style={styles.menuMapChooseFromTo_touch}
                                                        onPress={() => {
                                                            if (completedRoute){
                                                                hendleOrder()
                                                            } else {getDirections(coordsFrom, coordsTo)}
                                                        }}>
                                        <Text style={styles.menuMapChooseFromTo_touch_text}>OK</Text>
                                    </TouchableOpacity>
                                }
                            </View>
                        : null}
                    </View>
                    : <>
                        <TouchableOpacity style={styles.menuButton} onPress={() => {navigation.openDrawer()
                        }}>
                            <Ionicons name="ios-menu" size={32} color="black"/>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.orderButton} onPress={() => {
                            navigation.navigate('MapChooseFromTo', {
                                coordsMyLocation:coordsMyLocation,
                                addressFromInput:addressToInput,
                                addressToInput:addressToInput,
                                coordsFrom:region,
                                coordsTo:coordsTo,
                                mapChooseFromTo:true,
                                mapChooseTo:true
                            })

                        }}>
                            <Ionicons name="md-arrow-forward" size={24} color="black"/>
                        </TouchableOpacity>

                        {regionChangeProgress ? null :
                            <TouchableOpacity style={styles.where} onPress={() => {
                                navigation.navigate('Where', {
                                    addressFrom: regionLocationAddress, coordsMyLocation: coordsMyLocation,
                                    coordsFrom: region
                                })
                            }}>
                                <Text style={styles.addressTitle}>
                                    {regionLocationAddress.split(',', 2).join(',')}
                                </Text>
                                <Text style={styles.addressSubTitle}>Change address</Text>
                            </TouchableOpacity>
                        }

                        <TouchableOpacity style={styles.whereToButton} onPress={() => {
                            navigation.navigate('Where', {
                                addressFrom: regionLocationAddress, coordsMyLocation: coordsMyLocation,
                                coordsFrom: region, whereToAutoFocus:true
                            })
                        }}>
                            <View style={styles.whereToButton__wrapper}>
                                <Ionicons name="ios-search" size={22} color="black"/>
                                <Text style={styles.whereToButton__text}> Where to?</Text>
                            </View>
                        </TouchableOpacity>
                    </>
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

HomeScreen.navigationOptions = () => ({
    headerShown: false
});

export default HomeScreen