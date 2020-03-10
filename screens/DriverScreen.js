import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, FlatList, Dimensions, ActivityIndicator} from 'react-native';
import {Ionicons} from "@expo/vector-icons";
import Fire from "../Fire";
import moment from "moment";

const firebase = require("firebase");
require("firebase/firestore");

const screen = Dimensions.get('window')

function DriverScreen({navigation}) {
    const openOrders = [];
    const [oOrders, setOOrders] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [driver, setDriver] = useState({
        avatar: null,
        rating: null,
        email: null,
        name: null,
        nameCar: null,
        numberCar: null,
        phoneNumber: null,
    });

    const getOpenOrders = () => {
        setIsLoading(true);
        Fire.shared.firestore.collection("orders")
            .where('openOrder', '==', true)
            .get()
            .then(snapshot => {
                if (snapshot.empty) {
                    setOOrders(null)
                    setIsLoading(false)
                    waitOpenOrder()
                    return;
                }
                snapshot.forEach(doc => {
                    let openOrder = doc.data();
                    openOrder.id = doc.id;
                    Fire.shared.firestore.collection("users")
                        .doc(openOrder.uid)
                        .onSnapshot(docUser => {
                            openOrder.user = docUser.data();
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
    useEffect(getOpenOrders, [navigation.state.params]);

    useEffect(() => Fire.shared.getUserInfo(setDriver), []);

    const waitOpenOrder = () => {
        setTimeout(getOpenOrders, 5000)
    }

    const transportChoice = (numberTransport) => {
        if (numberTransport === 1) {
            return 'Eco'
        }
        if (numberTransport === 2) {
            return 'Comfort'
        }
        if (numberTransport === 3) {
            return 'Business'
        } else {
            return 'Truck'
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Open Orders</Text>
            </View>

            <TouchableOpacity style={styles.menuButton} onPress={() => {
                navigation.openDrawer()
            }}>
                <Ionicons name="ios-menu" size={32} color="black"/>
            </TouchableOpacity>

            <Text style={styles.nameApp}>MyUber (Driver)</Text>

            {oOrders && <FlatList
                style={styles.feed}
                data={oOrders}
                keyExtractor={item => item.id}
                onRefresh={getOpenOrders}
                refreshing={isLoading}
                showsVerticalScrollIndicator={false}
                renderItem={({item}) => (
                    <View style={styles.openOrderCard}>
                        <View style={styles.openOrderCard_nameRow}>
                            <View style={styles.openOrderCard_Row}>
                                <Text style={styles.openOrderCard_Row_bold}>Name: </Text>
                                <Text>{item.user.name}</Text>
                            </View>
                            <Text>{moment(item.timestamp).fromNow()}</Text>
                        </View>
                        <View style={styles.openOrderCard_Row}>
                            <Text style={styles.openOrderCard_Row_bold}>Type: </Text>
                            <Text
                                style={styles.openOrderCard_Row_text}>{transportChoice(item.transportCardChoice)}</Text>
                        </View>
                        <View style={styles.openOrderCard_Row}>
                            <Text style={styles.openOrderCard_Row_bold}>Distance: </Text>
                            <Text style={styles.openOrderCard_Row_text}>{item.distance} m</Text>
                        </View>
                        <View style={styles.openOrderCard_Row}>
                            <Text style={styles.openOrderCard_Row_bold}>Address From: </Text>
                            <Text style={styles.openOrderCard_Row_text}>{item.addressFromInput}</Text>
                        </View>
                        <View style={styles.openOrderCard_Row}>
                            <Text style={styles.openOrderCard_Row_bold}>Address To: </Text>
                            <Text style={styles.openOrderCard_Row_text}>{item.addressToInput}</Text>
                        </View>
                        {item.addInfo.length > 0 &&
                        <View style={styles.openOrderCard_Row}>
                            <Text style={styles.openOrderCard_Row_bold}>Info: </Text>
                            <Text style={styles.openOrderCard_Row_text}>{item.addInfo}</Text>
                        </View>
                        }
                        <View style={styles.openOrderCard_iconsRow}>
                            <TouchableOpacity onPress={() => {
                                navigation.navigate('RouteMap', {
                                    coords: item.coords,
                                    coordsFrom: item.coordsFrom,
                                    coordsTo: item.coordsTo,
                                    name: item.user.name,
                                    idOrder: item.id,
                                    client: item,
                                    driver: driver
                                })
                            }}>
                                <Ionicons name="ios-globe" size={45} color="green"/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                navigation.navigate('RouteMap', {
                                    coords: item.coords,
                                    coordsFrom: item.coordsFrom,
                                    coordsTo: item.coordsTo,
                                    name: item.user.name,
                                    idOrder: item.id,
                                    client: item,
                                    driver: driver,
                                    isAgree: true
                                })
                            }}>
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
    loading: {
        flex: 1,
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
        margin: 2,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 20
    },
    openOrderCard_nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    openOrderCard_Row: {
        flexDirection: 'row',
        borderColor: '#d8d8d8',
        borderBottomWidth: 1
    },
    openOrderCard_Row_bold: {
        fontWeight: 'bold',
        width: 70
    },
    openOrderCard_Row_text: {
        width: screen.width - 130,
    },
    openOrderCard_iconsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: '20%'
    },
});

DriverScreen.navigationOptions = () => ({
    headerShown: false
});

export default DriverScreen