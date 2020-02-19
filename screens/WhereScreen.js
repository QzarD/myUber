import React,{useState} from 'react';
import {StyleSheet, Text, View, TextInput, TouchableOpacity} from 'react-native';
import {Ionicons} from "@expo/vector-icons";

function WhereScreen({navigation}) {
    const [addressFromInput, setAddressFromInput] = useState(navigation.getParam('addressFrom').split(',')[0]);
    const [addressToInput, setAddressToInput] = useState('');
    const [results, setResult] = useState(null);

    const fetchAddress = (address) => {
        fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?key=AIzaSyCPI7BA17dVl-icguki6m5UwA9qf7DO-Iw&input=${address}`)
            .then((response) => response.json())
            .then((responseJson) => {
                /*setRegionLocationAddress(responseJson.results[0].formatted_address);*/
                console.log(responseJson.results)
            });
    }

    return (
        <View style={styles.container}>
            <View style={styles.fromTo}>
                <View style={styles.fromTo__row}>
                    <Ionicons style={styles.ico} name="ios-search" size={22} color="#575757"/>
                    <TextInput style={styles.input} placeholder='Where from?'
                               onChangeText={text => {
                                   setAddressFromInput(text);
                                   fetchAddress(text)
                               }}
                               value={addressFromInput}/>
                    {addressFromInput.length>0
                        ?
                            <TouchableOpacity style={styles.x} onPress={()=>{setAddressFromInput('')}}>
                                <Ionicons name="ios-close" size={33} color="#575757"/>
                            </TouchableOpacity>
                        : null
                    }
                    <View style={styles.button} >
                        <View style={styles.text_row}>
                            <TouchableOpacity onPress={()=>{}}>
                                <Text style={styles.text}>Map</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={styles.fromTo__row}>
                    <Ionicons style={styles.ico} name="ios-search" size={22} color="#575757"/>
                    <TextInput style={[styles.input, {borderTopColor:'#d2d2d2', borderTopWidth:1}]}
                               placeholder='Where to?'
                               onChangeText={text => setAddressToInput(text)}
                               value={addressToInput}/>
                               <View style={{borderTopColor:'#d2d2d2', borderTopWidth:1}}>
                                    {addressToInput.length>0
                                        ?
                                        <TouchableOpacity style={styles.x}
                                                          onPress={()=>{setAddressToInput('')}}>
                                            <Ionicons name="ios-close" size={33} color="#575757"/>
                                        </TouchableOpacity>
                                        : null
                                    }
                               </View>
                    <View style={[styles.button, {borderTopColor:'#d2d2d2', borderTopWidth:1}]} >
                        <View style={styles.text_row}>
                            <TouchableOpacity onPress={()=>{}}>
                                <Text style={styles.text}>Map</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.result}>
                <View style={styles.result__address}>
                    <Text style={styles.result__address_text}>1600 Amphitheatre Pkwy</Text>
                    <Text style={styles.result__address_subtext}>Mountain View, CA 94043, USA</Text>
                </View>
                <View style={styles.result__distance}>
                    <Text style={styles.result__distance_text}>100km</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fbfbfb',
        alignItems: 'center',
    },
    fromTo:{
        marginTop: '20%',
        width:'90%',
        borderRadius:8,
        backgroundColor: 'white',
        shadowColor: '#000000',
        elevation: 10,
        shadowOpacity: 0.4,
        shadowRadius: 3.5
    },
    fromTo__row:{
        flexDirection:'row',
        height:60,
        marginHorizontal:'2%'
    },
    ico:{
        width:'9%',
        textAlign:'center',
        paddingTop:20
    },
    input:{
        flex:1,
        fontSize:18
    },
    button:{
        width:50,
    },
    text_row:{
        borderLeftColor:'#d2d2d2',
        borderLeftWidth:1,
        height: 35,
        marginTop: 12
    },
    text:{
        textAlign:'center',
        marginTop: 8
    },
    x:{
        width: 25,
        textAlign:'center',
        paddingTop:14
    },
    result:{
        flexDirection: 'row',
        justifyContent:'space-between',
        width:'80%',
        marginLeft:'9%',
        paddingVertical:10,
        borderBottomColor:'#e5e5e5',
        borderBottomWidth:1,
    },
    result__address_text:{
        fontSize: 17
    },
    result__address_subtext:{
        color:'#6c6c6c',
        paddingLeft:3
    },
    result__distance_text:{
        color:'#6c6c6c',
        paddingTop:13,
        paddingRight:5
    }
});

WhereScreen.navigationOptions =()=> ({
    headerShown: false
});

export default WhereScreen