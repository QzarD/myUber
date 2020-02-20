import React, {useState, useCallback} from 'react';
import {StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Dimensions} from 'react-native';
import {Ionicons} from "@expo/vector-icons";
import {debounce} from "lodash";

const screen=Dimensions.get('window')

function WhereScreen({navigation}) {
    const coordsMyLocation = navigation.getParam('coordsMyLocation');
    const [addressFromInput, setAddressFromInput] = useState(navigation.getParam('addressFrom').split(',')[0]);
    const [addressToInput, setAddressToInput] = useState('');
    const [results, setResult] = useState([]);
    const [onFocusFrom, setOnFocusFrom] = useState(null);
    const [coordsFrom, setCoordsFrom] = useState(navigation.getParam('coordsFrom'));

    const fetchAddress = (text, lat, lon) => {
        fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?key=AIzaSyCPI7BA17dVl-icguki6m5UwA9qf7DO-Iw&input=${text}&origin=${lat},${lon}&components=country:us`)
            .then((response) => response.json())
            .then((responseJson) => {
                setResult(responseJson.predictions);
            });
    }

    const handler = useCallback(debounce((text) => {
        fetchAddress(text, coordsMyLocation.latitude, coordsMyLocation.longitude)
    }, 1000), []);

    const distanceCorrecting=(numb)=>{
        if (numb<100){
            return (`${numb} m`)
        } else {
            let x=Math.round(numb/1000);
            return (`${x} km`)
        }
    }

    const chooseFrom=(item)=>{
        setAddressFromInput((item.description).split(',')[0])
        fetch(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${item.place_id}&key=AIzaSyCPI7BA17dVl-icguki6m5UwA9qf7DO-Iw`)
            .then((response) => response.json())
            .then((responseJson) => {
                setCoordsFrom({
                    latitude: responseJson.result.geometry.location.lat,
                    longitude: responseJson.result.geometry.location.lng,
                    latitudeDelta: 0.001,
                    longitudeDelta: 0.004,
                });
            });
    }

    return (
        <View style={styles.container}>
            <View style={styles.fromTo}>
                <View style={styles.fromTo__row}>
                    <Ionicons style={[styles.ico, onFocusFrom === true ? null : {paddingTop: 22}]}
                              name={onFocusFrom === true ? "ios-search" : "ios-radio-button-off"}
                              size={onFocusFrom === true ? 22 : 16} color="#FF536A"/>
                    <TextInput style={styles.input} placeholder='Where from?'
                               onChangeText={text => {
                                   setAddressFromInput(text);
                                   handler(text)
                               }}
                               value={addressFromInput}
                               autoFocus={true}
                               onFocus={() => setOnFocusFrom(true)}/>
                    {(addressFromInput && addressFromInput.length > 0 && onFocusFrom === true)
                        ?
                        <TouchableOpacity style={styles.x} onPress={() => {
                            setAddressFromInput('')
                        }}>
                            <Ionicons name="ios-close" size={33} color="#575757"/>
                        </TouchableOpacity>
                        : null
                    }
                    <View style={styles.button}>
                        {onFocusFrom === true
                            ? <View style={styles.text_row}>
                                <TouchableOpacity onPress={() => {
                                }}>
                                    <Text style={styles.text}>Map</Text>
                                </TouchableOpacity>
                            </View>
                            : null
                        }
                    </View>
                </View>
                <View style={styles.fromTo__row}>
                    <Ionicons style={[styles.ico, onFocusFrom === false ? null : {paddingTop: 22}]}
                              name={onFocusFrom === false ? "ios-search" : "ios-radio-button-off"}
                              size={onFocusFrom === false ? 22 : 16} color="#575757"/>
                    <TextInput style={[styles.input, {borderTopColor: '#d2d2d2', borderTopWidth: 1}]}
                               placeholder='Where to?'
                               onChangeText={text => setAddressToInput(text)}
                               value={addressToInput}
                               onFocus={() => setOnFocusFrom(false)}/>
                    <View style={{borderTopColor: '#d2d2d2', borderTopWidth: 1}}>
                        {(addressToInput && addressToInput.length > 0 && onFocusFrom === false)
                            ?
                            <TouchableOpacity style={styles.x}
                                              onPress={() => {
                                                  setAddressToInput('')
                                              }}>
                                <Ionicons name="ios-close" size={33} color="#575757"/>
                            </TouchableOpacity>
                            : null
                        }
                    </View>
                    <View style={[styles.button, {borderTopColor: '#d2d2d2', borderTopWidth: 1}]}>
                        {onFocusFrom === false
                            ? <View style={styles.text_row}>
                                <TouchableOpacity onPress={() => {
                                }}>
                                    <Text style={styles.text}>Map</Text>
                                </TouchableOpacity>
                            </View>
                            : null
                        }
                    </View>
                </View>
            </View>
            {results.length>0 && <FlatList data={results} keyExtractor={(item)=>item.id} renderItem={({item})=>(
                <View style={styles.result}>
                    <TouchableOpacity style={styles.resultTouch} onPress={()=>{chooseFrom(item)}}>
                        <View style={styles.result__address}>
                            <Text style={styles.result__address_text}>{item.description.split(',', 1)}</Text>
                            <Text style={styles.result__address_subtext}>{item.description.split(',').slice(1).join(',')}</Text>
                        </View>
                        <View style={styles.result__distance}>
                            <Text style={styles.result__distance_text}>{distanceCorrecting(item.distance_meters)}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}/>}


        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fbfbfb',
        alignItems: 'center',
    },
    fromTo: {
        marginTop: '20%',
        width: '90%',
        borderRadius: 8,
        backgroundColor: 'white',
        shadowColor: '#000000',
        elevation: 10,
        shadowOpacity: 0.4,
        shadowRadius: 3.5
    },
    fromTo__row: {
        flexDirection: 'row',
        height: 60,
        marginHorizontal: '2%'
    },
    ico: {
        width: '9%',
        textAlign: 'center',
        paddingTop: 20
    },
    input: {
        flex: 1,
        fontSize: 18
    },
    button: {
        width: 50,
    },
    text_row: {
        borderLeftColor: '#d2d2d2',
        borderLeftWidth: 1,
        height: 35,
        marginTop: 12
    },
    text: {
        textAlign: 'center',
        marginTop: 8
    },
    x: {
        width: 25,
        textAlign: 'center',
        paddingTop: 14
    },
    result: {
        marginLeft:30,
        borderBottomColor: '#e5e5e5',
        borderBottomWidth: 1,
    },
    resultTouch: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    result__address: {
        width:(screen.width-140)
    },
    result__distance: {
    },
    result__address_text: {
        fontSize: 17,
    },
    result__address_subtext: {
        color: '#6c6c6c',
        paddingLeft: 3
    },
    result__distance_text: {
        color: '#6c6c6c',
        paddingTop: 13,
        paddingRight: 5
    }
});

WhereScreen.navigationOptions = () => ({
    headerShown: false
});

export default WhereScreen