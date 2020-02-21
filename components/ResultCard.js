import React from 'react';
import {Text, StyleSheet, TouchableOpacity, View, Dimensions} from "react-native";

const screen=Dimensions.get('window')

const ResultCard = ({item, touch, onFocusFrom}) => {

    const distanceCorrecting=(numb)=>{
        if (numb<100){
            return (`${numb} m`)
        } else {
            let x=Math.round(numb/1000);
            return (`${x} km`)
        }
    }

    return (
        <View style={styles.result}>
            <TouchableOpacity style={styles.resultTouch} onPress={() => {
                touch(item, onFocusFrom)
            }}>
                <View style={styles.result__address}>
                    <Text style={styles.result__address_text}>{item.description.split(',', 1)}</Text>
                    <Text style={styles.result__address_subtext}>{item.description.split(',').slice(1).join(',')}</Text>
                </View>
                <View style={styles.result__distance}>
                    <Text style={styles.result__distance_text}>{distanceCorrecting(item.distance_meters)}</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
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
})

export default ResultCard