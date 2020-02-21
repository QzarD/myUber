import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    PermissionsAndroid,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions, TextInput
} from "react-native";
import MapView from 'react-native-maps';
import {Ionicons, MaterialIcons} from "@expo/vector-icons";
import Polyline from "@mapbox/polyline";

const screen = Dimensions.get('window')

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

    useEffect(() => {
        localeCurrentPosition()
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


    const localeCurrentPosition = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoordsMyLocation({latitude: position.coords.latitude, longitude: position.coords.longitude});
                if (!mapChooseFromTo) {
                    setRegion({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        latitudeDelta: 0.001,
                        longitudeDelta: 0.004,
                    });/*
                    fetchAddress(position.coords.latitude, position.coords.longitude)*/
                }
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

    const fetchAddress = (lat, lon) => {
        setRegionChangeProgress(true)
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${lat},${lon}&key=AIzaSyD4SD_GFjTY_D7jndv6rBP4azTeu6NNQFM`)
            .then((response) => response.json())
            .then((responseJson) => {
                if (mapChooseFromTo && !mapChooseTo) {
                    setAddressFromInput(responseJson.results[0].formatted_address.split(',', 2).join(','))
                } else {
                    setAddressToInput(responseJson.results[0].formatted_address.split(',', 2).join(','))
                }
                setRegionLocationAddress(responseJson.results[0].formatted_address);
                setRegionChangeProgress(false);
                console.log(responseJson.results[0].formatted_address)
            });/*
        setRegionLocationAddress('1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA');
        console.log('1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA');*/
        setRegionChangeProgress(false);
    }

    const onRegionChange = (data) => {
        setRegion(data);
        if (mapChooseFromTo && !mapChooseTo) {
            setCoordsFrom(data)
        } else {
            setCoordsTo(data)
        }
        fetchAddress(data.latitude, data.longitude)
    }

    const getDirections=(coordsFrom, coordsTo)=>{
        let latFrom=coordsFrom.latitude;
        let lonFrom=coordsFrom.longitude;
        let latTo=coordsTo.latitude;
        let lonTo=coordsTo.longitude;
        fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${latFrom},${lonFrom}&destination=${latTo},${lonTo}&key=AIzaSyAxDMt-Yh3pq8AIVDV7EtniQ9HHEFricS8`)
            .then((response) => response.json())
            .then((responseJson) => {
                const points=Polyline.decode(responseJson.routes[0].overview_polyline.points);
                const coords=points.map(point=>{
                    return {
                        latitude:point[0], longitude:point[1]
                    }
                })
                setCoords(coords)
            });
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
                    initialRegion={region}
                    onRegionChangeComplete={onRegionChange}
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

                <Ionicons style={styles.flag} name="ios-pin" size={46} color={(mapChooseFromTo && mapChooseTo) ?"#575757":"#FF536A"}/>

                <TouchableOpacity style={[styles.myLocationButton, {bottom: mapChooseFromTo ? 230 : '15%'}]}
                                  onPress={() => centerMap()}>
                    <MaterialIcons name="my-location" size={24} color="black"/>
                </TouchableOpacity>

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
                            <Text style={styles.menuMapChooseFromTo_text}>min 5$</Text>
                        </View>
                        <View style={styles.menuMapChooseFromTo_row}>
                            <TouchableOpacity style={styles.menuMapChooseFromTo_touch}
                                              onPress={() => getDirections(coordsFrom,coordsTo)}>
                                <Text style={styles.menuMapChooseFromTo_touch_text}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    : <>
                        <TouchableOpacity style={styles.menuButton} onPress={() => {
                        }}>
                            <Ionicons name="ios-menu" size={32} color="black"/>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.orderButton} onPress={() => {
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
                            fetchAddress(region.latitude, region.longitude)
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
        color: '#2d2d2d',
        paddingRight:15
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
});

HomeScreen.navigationOptions = () => ({
    headerShown: false
});

export default HomeScreen