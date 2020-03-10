import React, {useState, useCallback, useEffect} from 'react';
import {StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Dimensions} from 'react-native';
import {Ionicons} from "@expo/vector-icons";
import {debounce} from "lodash";
import ResultCard from "../components/ResultCard";
import {autocompleteKey, detailsKey} from "../keys";


function WhereScreen({navigation}) {
    const coordsMyLocation = navigation.getParam('coordsMyLocation');
    const whereToAutoFocus = navigation.getParam('whereToAutoFocus');

    const [addressFromInput, setAddressFromInput] = useState(navigation.getParam('addressFrom').split(',')[0]);
    const [addressToInput, setAddressToInput] = useState('');
    const [resultsFrom, setResultsFrom] = useState([]);
    const [resultsTo, setResultsTo] = useState([]);
    const [onFocusFrom, setOnFocusFrom] = useState(true);
    const [coordsFrom, setCoordsFrom] = useState(navigation.getParam('coordsFrom'));
    const [coordsTo, setCoordsTo] = useState(null);

    useEffect(() => {
        setCoordsTo(navigation.getParam('coordsTo'));
        setAddressToInput(navigation.getParam('addressTo'))
        setCoordsFrom(navigation.getParam('coordsFrom'));
        setAddressFromInput(navigation.getParam('addressFrom'))
    }, [navigation]);

    const fetchAddress = (pushFrom, text, lat, lon) => {
        fetch(autocompleteKey(text,lat,lon))
            .then((response) => response.json())
            .then((responseJson) => {
                pushFrom ?
                    setResultsFrom(responseJson.predictions)
                    : setResultsTo(responseJson.predictions)
            });
    }

    const handler = useCallback(debounce((text, pushFrom) => {
        fetchAddress(pushFrom, text, coordsMyLocation.latitude, coordsMyLocation.longitude);
    }, 1000), []);

    const chooseFrom = (item, pushFrom) => {
        pushFrom ? setAddressFromInput((item.description).split(',')[0]) : setAddressToInput((item.description).split(',')[0]);
        fetch(detailsKey(item.place_id))
            .then((response) => response.json())
            .then((responseJson) => {
                pushFrom ?
                        setCoordsFrom({
                            latitude: responseJson.result.geometry.location.lat,
                            longitude: responseJson.result.geometry.location.lng,
                            latitudeDelta: 0.001,
                            longitudeDelta: 0.004,
                        })
                    : setCoordsTo({
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
                    <TextInput style={[styles.input, (coordsFrom || onFocusFrom) ? null : {color: '#FF536A'}]}
                               placeholder='Where from?'
                               onChangeText={text => {
                                   setAddressFromInput(text);
                                   handler(text, true);
                                   (coordsFrom) ? setCoordsFrom(null) : null
                               }}
                               value={addressFromInput}
                               autoFocus={!whereToAutoFocus}
                               onFocus={() => setOnFocusFrom(true)}/>
                    {(addressFromInput && addressFromInput.length > 0 && onFocusFrom === true)
                        ?
                        <TouchableOpacity style={styles.x} onPress={() => {
                            setAddressFromInput('');
                            setCoordsFrom(null)
                        }}>
                            <Ionicons name="ios-close" size={33} color="#575757"/>
                        </TouchableOpacity>
                        : null
                    }
                    <View style={styles.button}>
                        {onFocusFrom
                            ? <View style={styles.text_row}>
                                <TouchableOpacity onPress={() => {
                                    navigation.navigate('MapChooseFromTo', {
                                        coordsMyLocation:coordsMyLocation,
                                        addressFromInput:addressFromInput,
                                        addressToInput:addressToInput,
                                        coordsFrom:coordsFrom,
                                        coordsTo:coordsTo,
                                        mapChooseFromTo:true,
                                        mapChooseTo:false
                                    })
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
                    <TextInput style={[styles.input,
                        {borderTopColor: '#d2d2d2', borderTopWidth: 1},
                        (coordsTo || !onFocusFrom) ? null : {color: '#FF536A'}]}
                               placeholder='Where to?'
                               onChangeText={text => {
                                   setAddressToInput(text);
                                   handler(text, false);
                                   (coordsTo) ? setCoordsTo(null) : null}
                               }
                               value={addressToInput}
                               autoFocus={whereToAutoFocus}
                               onFocus={() => setOnFocusFrom(false)}/>
                    <View style={{borderTopColor: '#d2d2d2', borderTopWidth: 1}}>
                        {(addressToInput && addressToInput.length > 0 && onFocusFrom === false)
                            ?
                            <TouchableOpacity style={styles.x}
                                              onPress={() => {
                                                  setAddressToInput('');
                                                  setCoordsTo(null)
                                              }}>
                                <Ionicons name="ios-close" size={33} color="#575757"/>
                            </TouchableOpacity>
                            : null
                        }
                    </View>
                    <View style={[styles.button, {borderTopColor: '#d2d2d2', borderTopWidth: 1}]}>
                        {!onFocusFrom
                            ? <View style={styles.text_row}>
                                <TouchableOpacity onPress={() => {
                                    navigation.navigate('MapChooseFromTo', {
                                        coordsMyLocation:coordsMyLocation,
                                        addressFromInput:addressFromInput,
                                        addressToInput:addressToInput,
                                        coordsFrom:coordsFrom,
                                        coordsTo:coordsTo,
                                        mapChooseFromTo:true,
                                        mapChooseTo:true
                                    })
                                }}>
                                    <Text style={styles.text}>Map</Text>
                                </TouchableOpacity>
                            </View>
                            : null
                        }
                    </View>
                </View>
            </View>
            {onFocusFrom && resultsFrom.length > 0 &&
            <FlatList data={resultsFrom} keyExtractor={(item) => item.id} renderItem={({item}) => (
                <ResultCard item={item} touch={chooseFrom} onFocusFrom={onFocusFrom}/>
            )}/>}
            {!onFocusFrom && resultsTo.length > 0 &&
            <FlatList data={resultsTo} keyExtractor={(item) => item.id} renderItem={({item}) => (
                <ResultCard item={item} touch={chooseFrom} onFocusFrom={onFocusFrom}/>
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
        paddingTop: 14,
        marginLeft: 10
    },

});

WhereScreen.navigationOptions = () => ({
    headerShown: false
});

export default WhereScreen