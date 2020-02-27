import React, {useState, useCallback, useEffect} from 'react';
import {StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Dimensions, ActivityIndicator} from 'react-native';
import {Ionicons, MaterialIcons} from "@expo/vector-icons";
import {debounce} from "lodash";
import ResultCard from "../components/ResultCard";
import MapView from "react-native-maps";
import Fire from "../Fire";
import * as firebase from "firebase";
import moment from "moment";

const screen = Dimensions.get('window')

function DriverScreen({navigation}) {
    const openOrders=[];
    const [coordsMyLocation, setCoordsMyLocation] = useState({latitude: null, longitude: null})
    const [coords, setCoords] = useState(null);
    const [oOrders, setOOrders] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const getOpenOrders=()=>{
        setIsLoading(true);
        Fire.shared.firestore.collection("orders")
            .where('openOrder', '==', true)
            .get()
            .then (snapshot=>{
                snapshot.forEach(doc=>{
                    let openOrder=doc.data();
                    openOrder.id=doc.id;
                    Fire.shared.firestore.collection("users")
                        .doc(openOrder.uid)
                        .onSnapshot(docUser=>{
                            openOrder.user=docUser.data();
                            openOrders.push(openOrder)
                            setOOrders(openOrders)
                            setIsLoading(false)
                        })
                })
            })
            .catch(err => {
                console.log('Error getting documents', err);
            });
    }

    useEffect(getOpenOrders, []);

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
    useEffect(localeCurrentPosition, []);

    const centerMap = async () => {
        await localeCurrentPosition();
        map.animateToRegion({
            latitude: coordsMyLocation.latitude,
            longitude: coordsMyLocation.longitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.004,
        });
    }

    const transportChoice=(numberTransport)=>{
        if (numberTransport===1){
            return 'Eco'
        }
        if (numberTransport===2){
            return 'Comfort'
        }
        if (numberTransport===3){
            return 'Business'
        } else {
            return 'Truck'
        }
    }

    return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Feed</Text>
                </View>

                <TouchableOpacity style={styles.menuButton} onPress={() => {navigation.openDrawer()
                }}>
                    <Ionicons name="ios-menu" size={32} color="black"/>
                </TouchableOpacity>

                <Text style={styles.nameApp}>MyUber (Driver)</Text>

                {oOrders && <FlatList
                    style={styles.feed}
                    data={oOrders}
                    keyExtractor={item => item.id}
                    refreshing={isLoading}
                    showsVerticalScrollIndicator={false}
                    renderItem={({item}) => (
                        <View style={styles.openOrderCard}>
                            <View style={styles.openOrderCard_nameRow}>
                                <Text >Name: {item.user.name}</Text>
                                <Text >{moment(item.timestamp).fromNow()}</Text>
                            </View>
                            <Text>Type: {transportChoice(item.transportCardChoice)}</Text>
                            <Text >Distance: {item.distance} m</Text>
                            <Text >Address From: {item.addressFromInput}</Text>
                            <Text >Address To: {item.addressToInput}</Text>
                            {item.addInfo.length>0 && <Text >Info: {item.addInfo}</Text>}
                            <View style={styles.openOrderCard_iconsRow}>
                                <TouchableOpacity onPress={()=>{
                                    navigation.navigate('RouteMap',{
                                        coords:item.coords,
                                        coordsFrom:item.coordsFrom,
                                        coordsTo:item.coordsTo
                                    })
                                }}>
                                    <Ionicons name="ios-globe" size={45} color="black"/>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={()=>{}}>
                                    <Ionicons name="ios-checkmark-circle-outline" size={45} color="black"/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
                }
            </View>
        );
}

const styles = StyleSheet.create({
    loading:{
        flex:1,
        justifyContent: "center",
        alignItems: "center"
    },
    feed: {
        marginHorizontal: 16
    },
    container: {
        flex: 1
    },
    header: {
        paddingTop: 64,
        paddingBottom: 16,
        backgroundColor: "#FFF",
        alignItems: "center",
        justifyContent: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#EBECF4",
        shadowColor: "#454D65",
        shadowOffset: {height: 5},
        shadowRadius: 15,
        shadowOpacity: 0.2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "500"
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
    openOrderCard: {
        margin: 10,
        paddingHorizontal:10,
        paddingVertical:5,
        borderColor:'black',
        borderWidth:1,
        borderRadius: 20
    },
    openOrderCard_nameRow: {
        flexDirection:'row',
        justifyContent:'space-between'
    },
    openOrderCard_iconsRow: {
        flexDirection:'row',
        justifyContent:'space-between',
        marginHorizontal: '20%'
    },
});

DriverScreen.navigationOptions = () => ({
    headerShown: false
});

export default DriverScreen