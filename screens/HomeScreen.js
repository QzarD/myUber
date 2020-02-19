import React, {useEffect, useState} from "react";
import {View, Text, StyleSheet, PermissionsAndroid, ActivityIndicator, TouchableOpacity, Dimensions} from "react-native";
import MapView from 'react-native-maps';
import {Ionicons, MaterialIcons} from "@expo/vector-icons";

const screen=Dimensions.get('window')

const HomeScreen = ({navigation}) => {
    const [coordsMyLocation, setCoordsMyLocation] = useState({latitude: null, longitude: null})
    const [regionChangeProgress, setRegionChangeProgress] = useState(true)
    const [regionLocationAddress, setRegionLocationAddress] = useState('')
    const [region, setRegion] = useState({latitude: 100,
        longitude: 20,
        latitudeDelta: 1,
        longitudeDelta: 1})


    const localeCurrentPosition = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoordsMyLocation({latitude: position.coords.latitude, longitude: position.coords.longitude});
                setRegion({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    latitudeDelta: 0.001,
                    longitudeDelta: 0.004,
                });
                fetchAddress(position.coords.latitude, position.coords.longitude)
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
            latitude: coordsMyLocation.latitude,
            longitude: coordsMyLocation.longitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.004,
        });
    }

    const fetchAddress = (lat,lon) => {
        setRegionChangeProgress(true)
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${lat},${lon}&key=AIzaSyD4SD_GFjTY_D7jndv6rBP4azTeu6NNQFM`)
            .then((response) => response.json())
            .then((responseJson) => {
                setRegionLocationAddress(responseJson.results[0].formatted_address);
                setRegionChangeProgress(false);
                console.log(responseJson.results[0].formatted_address)
            });
    }

    const onRegionChange=(data)=>{
        setRegion(data);
        fetchAddress(data.latitude, data.longitude)
    }

    if(coordsMyLocation.latitude){
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
                    {/*<MapView.Marker
                        coordinate={{ "latitude": region.latitude,
                            "longitude": region.longitude }}
                        title={"Your Location"}
                        draggable />*/}
                </MapView>
                <TouchableOpacity style={styles.menuButton} onPress={() => {}}>
                    <Ionicons name="ios-menu" size={32} color="black"/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.orderButton} onPress={() => {}}>
                    <Ionicons name="md-arrow-forward" size={24} color="black"/>
                </TouchableOpacity>
                <Text style={styles.nameApp}>MyUber</Text>

                {regionChangeProgress ? null :
                    <TouchableOpacity style={styles.where} onPress={() => {
                        navigation.navigate('Where',{addressFrom:regionLocationAddress})
                    }}>
                        <Text style={styles.addressTitle}>
                             {regionLocationAddress.split(',', 2).join(',')}
                        </Text>
                        <Text style={styles.addressSubTitle}>Change address</Text>
                    </TouchableOpacity>
                }

                <Ionicons style={styles.flag} name="ios-pin" size={46} color="#FF536A"/>

                <TouchableOpacity style={styles.myLocationButton} onPress={() => centerMap()}>
                    <MaterialIcons name="my-location" size={24} color="black"/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.whereToButton} onPress={() => {fetchAddress(region.latitude,region.longitude)}}>
                    <View style={styles.whereToButton__wrapper}>
                        <Ionicons name="ios-search" size={22} color="black"/>
                        <Text style={styles.whereToButton__text}> Where to?</Text>
                    </View>
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
    containerCenter:{
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
    flag:{
        position: "absolute",
        top:(screen.height/2 -42),
        left:(screen.width/2 -12),
    },
    myLocationButton: {
        position: "absolute",
        bottom: '15%',
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
    nameApp:{
        position: 'absolute',
        fontSize:20,
        color: '#7a7a7a',
        top:35,
        width:200,
        left:(screen.width/2 -100),
        textAlign: 'center',
    },
    where:{
        position: 'absolute',
        top:'15%',
        width:'100%',
        textAlign: 'center',
    },
    fromTo:{
        fontSize:14,
        color: '#a7a7a7',
        textAlign: 'center',
        paddingTop:5
    },
    addressTitle:{
        fontSize:35,
        color: '#1a1a1a',
        textAlign: 'center',
    },
    addressSubTitle:{
        fontSize:17,
        fontWeight: 'bold',
        color: '#7a7a7a',
        textAlign: 'center',
    },
    whereToButton:{
        position: 'absolute',
        bottom:'5%',
        backgroundColor: 'white',
        height:45,
        width:'80%',
        left:(screen.width*0.1),
        borderRadius:22,
        alignItems:'center',
        shadowColor: '#000000',
        elevation: 5,
        shadowOpacity: 0.2,
        shadowRadius: 3.5
    },
    whereToButton__wrapper:{
        flexDirection: 'row',
        alignItems:'center',
        paddingTop: 9,
    },
    whereToButton__text:{
        fontSize:18,
        fontWeight: 'bold',
        color: '#7a7a7a',
        textAlign: 'center',
    }
});

HomeScreen.navigationOptions =()=> ({
    headerShown: false
});

export default HomeScreen