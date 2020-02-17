import React from "react";
import {StyleSheet, Text, TextInput, View, TouchableOpacity, Image, StatusBar} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import Fire from '../Fire';

export default class SignupScreen extends React.Component {
    static navigationOptions = {
        headerShown: false
    };

    state = {
        user: {
            name: "",
            email: "",
            password: ""
        },
        errorMessage: null
    };

    handleSignUp = () => {
        Fire.shared.createUser(this.state.user);
    };

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity style={styles.back} onPress={() => this.props.navigation.goBack()}>
                    <Ionicons name="ios-arrow-round-back" size={32} color="#FFF"/>
                </TouchableOpacity>

                <Text style={styles.greeting}>{`Hello!\nSign up to get started.`}</Text>

                <View style={styles.errorMessage}>
                    {this.state.errorMessage && <Text style={styles.error}>{this.state.errorMessage}</Text>}
                </View>

                <View style={styles.form}>
                    <View>
                        <Text style={styles.inputTitle}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={name => this.setState({user: {...this.state.user, name}})}
                            value={this.state.user.name}
                        />
                    </View>

                    <View style={{marginTop: 1}}>
                        <Text style={styles.inputTitle}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            onChangeText={email => this.setState({user: {...this.state.user, email}})}
                            value={this.state.user.email}
                        />
                    </View>

                    <View style={{marginTop: 1}}>
                        <Text style={styles.inputTitle}>Password</Text>
                        <TextInput
                            style={styles.input}
                            secureTextEntry
                            autoCapitalize="none"
                            onChangeText={password => this.setState({user: {...this.state.user, password}})}
                            value={this.state.user.password}
                        />
                    </View>
                </View>

                <TouchableOpacity style={styles.button} onPress={this.handleSignUp}>
                    <Text style={{color: "#FFF", fontWeight: "500"}}>Sign up</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{alignSelf: "center", marginTop: 1}}
                    onPress={() => this.props.navigation.navigate("Login")}
                >
                    <Text style={{color: "#414959", fontSize: 13}}>
                        Already have an account? <Text style={{fontWeight: "500", color: "#E9446A"}}>Sign in</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    greeting: {
        marginTop: 32,
        fontSize: 18,
        fontWeight: "500",
        textAlign: "center",
    },
    form: {
        marginBottom: 19,
        marginHorizontal: 30
    },
    inputTitle: {
        color: "#8A8F9E",
        fontSize: 10,
        textTransform: "uppercase"
    },
    input: {
        borderBottomColor: "#8A8F9E",
        borderBottomWidth: StyleSheet.hairlineWidth,
        height: 40,
        fontSize: 15,
        color: "#161F3D"
    },
    button: {
        marginHorizontal: 30,
        backgroundColor: "#E9446A",
        borderRadius: 4,
        height: 52,
        alignItems: "center",
        justifyContent: "center"
    },
    errorMessage: {
        height: 72,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 30
    },
    error: {
        color: "#E9446A",
        fontSize: 13,
        fontWeight: "600",
        textAlign: "center"
    },
    back: {
        position: "absolute",
        top: 48,
        left: 32,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(21, 22, 48, 0.1)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 5
    }
});