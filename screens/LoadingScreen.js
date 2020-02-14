import React, {useEffect} from "react";
import {View, Text, StyleSheet, ActivityIndicator} from "react-native";
import * as firebase from "firebase";

export const LoadingScreen = () => {
    useEffect(firebase.auth().onAuthStateChanged(user => {
        this.props.navigation.navigate(user ? "App" : "Auth");
    }), [])

    return (
        <View style={styles.container}>
            <Text>Loading...</Text>
            <ActivityIndicator size="large"/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }
});