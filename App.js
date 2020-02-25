import React from 'react';
import * as firebase from "firebase";
import {firebaseConfig} from "./config";
import {createAppContainer, createSwitchNavigator} from "react-navigation";
import {createStackNavigator} from "react-navigation-stack";
import HomeScreen from "./screens/HomeScreen";
import SignupScreen from "./screens/SignupScreen";
import {Ionicons} from '@expo/vector-icons';
import {createBottomTabNavigator} from "react-navigation-tabs";
import LoginScreen from "./screens/LoginScreen";
import LoadingScreen from "./screens/LoadingScreen";
import WhereScreen from "./screens/WhereScreen";
import FindDriverScreen from "./screens/FindDriverScreen";


/*if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}*/

const AppContainer = createStackNavigator({
    Home: HomeScreen,
    Where: WhereScreen,
    MapChooseFromTo: HomeScreen,
    FindDriver: FindDriverScreen
});

const AuthStack = createStackNavigator({
  Login: LoginScreen,
  Signup: SignupScreen
});

export default createAppContainer(
    createSwitchNavigator(
        {
          Loading: LoadingScreen,
          App: AppContainer,
          Auth: AuthStack
        },
        {
          initialRouteName: "Loading"
        }
    )
);