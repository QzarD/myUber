import React, {useState, useEffect} from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator, Linking
} from 'react-native';
import {Ionicons, MaterialIcons} from "@expo/vector-icons";
import MapView from "react-native-maps";
import Fire from "../Fire";

const screen = Dimensions.get('window')

function FindDriverScreen({navigation}) {
    const id = navigation.getParam('id');
    const coords = navigation.getParam('coords');
    const distance = navigation.getParam('distance');
    const transportCardChoice = navigation.getParam('transportCardChoice');
    const [coordsMyLocation, setCoordsMyLocation] = useState({latitude: null, longitude: null});
    const [driver, setDriver] = useState(null);
    const [isCompleteOrder, setIsCompleteOrder] = useState(false);
    const [stars, setStars] = useState(1);
    const [midRating, setMidRating] = useState(0);


    useEffect(() => {
        localeCurrentPosition();
        checkOrderStatus()
    }, []);

    const checkOrderStatus = () => {
        Fire.shared.checkOrder({id: navigation.getParam('id')})
            .then(ref => {
                if (ref.completeOrder === true){
                    setIsCompleteOrder(true)
                } else {
                    if (ref.openOrder === false) {
                        setDriver(ref.driver);
                        calcRating(ref.driver.uid);
                        checkOrderStatus()
                    } else {
                        setTimeout(checkOrderStatus, driver ? 10000 : 5000)
                    }
                }

            })
            .catch(err => {
                alert('You canceled the order')
            })
    }

    const calcRating=(idDriver)=>{
        Fire.shared.firestore.collection('users').doc(idDriver).get()
            .then(doc=>{
                let rating=doc.data().rating
                let sumRating=rating.reduce((a,b)=>a+b,0)
                let midRating=sumRating/rating.length
                setMidRating(midRating)
            })
    }

    const deleteOrder = () => {
        Fire.shared.deleteOrder({id: navigation.getParam('id')})
            .then(ref => {
                navigation.navigate('MapChooseFromTo')
            })
            .catch(err => {
                alert(err)
            })
    }
    const sendDriverRating = () => {
        Fire.shared.sendRating(driver.uid, stars)
    }

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

    const distanceRound=(distance, rate, min)=>{
        let x=Math.round(distance/rate);
        if (x<10){
            return  `${min}$`
        } else {return `${x}$`}
    }

    const rateCar=()=>{
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
                {coords && <MapView.Polyline strokeWidth={2} strokeColor='red' coordinates={coords}/>}
                {/*<MapView.Marker
                        coordinate={{ "latitude": region.latitude,
                            "longitude": region.longitude }}
                        title={"Your Location"}
                        draggable />*/}
            </MapView>

            <TouchableOpacity style={styles.menuButton} onPress={() => {
                navigation.openDrawer()
            }}>
                <Ionicons name="ios-menu" size={32} color="black"/>
            </TouchableOpacity>

            <Text style={styles.nameApp}>MyUber</Text>

            {!isCompleteOrder &&
                <TouchableOpacity style={[styles.myLocationButton, {bottom: 230}]}
                                                       onPress={() => centerMap()}>
                    <MaterialIcons name="my-location" size={24} color="black"/>
                </TouchableOpacity>
            }


            {driver
                ? (!isCompleteOrder && <View style={styles.isTakeOpenOrder}>
                    <Text>Driver: {driver.name}</Text>
                    <Text>Rating: {midRating}</Text>
                    <Text>Car: {driver.nameCar}, number: {driver.numberCar}</Text>
                    <Text>Waiting time: {driver.duration}</Text>
                    <View style={styles.isTakeOpenOrder_row}>
                        <TouchableOpacity style={styles.isTakeOpenOrder_button}
                                          onPress={() => Linking.openURL(`tel:${driver.phoneNumber}`)}>
                            <Ionicons style={styles.isTakeOpenOrder_ico} name="ios-call" size={45} color="green"/>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.isTakeOpenOrder_button}>
                            <Ionicons style={styles.isTakeOpenOrder_ico} name="ios-chatbubbles" size={45}
                                      color="#fb5d58"/>
                        </TouchableOpacity>
                    </View>
                </View>)
                : <View style={styles.findCar}>
                    <Text style={styles.findCar_text}>Car search...</Text>
                    <ActivityIndicator size='large'/>
                    <TouchableOpacity onPress={() => deleteOrder()} style={styles.findCar_cancel}>
                        <Ionicons name="ios-close-circle-outline" size={30} color="black"/>
                        <Text style={styles.findCar_cancel_text}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            }
            {isCompleteOrder &&
                <View style={styles.isCompleteOrder}>
                    <Text style={styles.isCompleteOrder_title}>You need to pay:</Text>
                    <View style={styles.isCompleteOrder_pay}>
                        <Ionicons style={styles.isCompleteOrder_pay_ico} name="ios-cash" size={30} color="black"/>
                        <Text style={styles.isCompleteOrder_text}>
                            {distanceRound(distance, rateCar(),
                                transportCardChoice===4?30:transportCardChoice===3?20:transportCardChoice===2?15:10)}
                        </Text>
                    </View>
                    <Text style={styles.isCompleteOrder_title}>Driver rating:</Text>
                    <View style={styles.isCompleteOrder_starsRow}>
                        <TouchableOpacity onPress={()=>setStars(1)}>
                            <Ionicons style={styles.isCompleteOrder_starsRow_star}
                                      name="ios-star" size={35} color="orange"/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>setStars(2)}>
                            <Ionicons style={styles.isCompleteOrder_starsRow_star}
                                      name={stars>1 ? "ios-star" : "ios-star-outline"} size={35} color="orange"/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>setStars(3)}>
                            <Ionicons style={styles.isCompleteOrder_starsRow_star}
                                      name={stars>2 ? "ios-star" : "ios-star-outline"} size={35} color="orange"/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>setStars(4)}>
                            <Ionicons style={styles.isCompleteOrder_starsRow_star}
                                      name={stars>3 ? "ios-star" : "ios-star-outline"} size={35} color="orange"/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>setStars(5)}>
                            <Ionicons style={styles.isCompleteOrder_starsRow_star}
                                      name={stars>4 ? "ios-star" : "ios-star-outline"} size={35} color="orange"/>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.isCompleteOrder_button} onPress={()=>{
                        sendDriverRating();
                        setIsCompleteOrder(false);
                        navigation.navigate('Home', {lastUpdate: new Date()})
                    }}>
                        <Text style={styles.isCompleteOrder_button_title}>OK</Text>
                    </TouchableOpacity>
                </View>
            }

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
        paddingHorizontal: 35,
        paddingVertical: 25
    },
    findCar_text: {
        fontSize: 25,
        marginBottom: 30
    },
    findCar_cancel: {
        flexDirection: 'row',
        height: 40,
        alignItems: "center"
    },
    findCar_cancel_text: {
        alignItems: "center",
        marginLeft: 15
    },
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
    isCompleteOrder: {
        position:'absolute',
        top:(screen.height/2 - 117),
        height:234,
        left:(screen.width/2 - 150),
        width:300,
        backgroundColor:'white',
        borderRadius:10,
        paddingHorizontal:20,
        paddingVertical: 10

    },
    isCompleteOrder_title:{
        textAlign: 'center',
        marginBottom:15
    },
    isCompleteOrder_pay:{
        flexDirection:'row',
        justifyContent:'center',
        marginBottom:15
    },
    isCompleteOrder_pay_ico:{
        marginRight:10,
    },
    isCompleteOrder_text:{
        marginTop:3,
    },
    isCompleteOrder_starsRow:{
        flexDirection:'row',
        justifyContent:'space-between'
    },
    isCompleteOrder_starsRow_star:{
        marginBottom:25
    },
    isCompleteOrder_button:{
        backgroundColor:'#f5b981',
        height:40,
        marginHorizontal:40,
        borderRadius:10,
        justifyContent:'center',
    },
    isCompleteOrder_button_title:{
        textAlign:'center',
        fontWeight:'bold',
        color:'#725639'
    },
});

FindDriverScreen.navigationOptions = () => ({
    headerShown: false
});

export default FindDriverScreen