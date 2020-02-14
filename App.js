import React from 'react';
import * as firebase from "firebase";
import {firebaseConfig} from "./config";
import {createAppContainer, createSwitchNavigator} from "react-navigation";
import {createStackNavigator} from "react-navigation-stack";
import {HomeScreen} from "./screens/HomeScreen";
import SignupScreen from "./screens/SignupScreen";
import {LoadingScreen} from "./screens/LoadingScreen";
import {Ionicons} from '@expo/vector-icons';
import {createBottomTabNavigator} from "react-navigation-tabs";
import LoginScreen from "./screens/LoginScreen";


/*if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}*/

const AppContainer = createStackNavigator({
      default: createBottomTabNavigator({
            Home: {
              screen: HomeScreen,
              navigationOptions: {
                tabBarIcon: ({tintColor}) => <Ionicons name='ios-home' size={24} color={tintColor}/>
              }
            },
            Message: {
              screen: HomeScreen,
              navigationOptions: {
                tabBarIcon: ({tintColor}) => <Ionicons name='ios-chatboxes' size={24} color={tintColor}/>
              }
            },
            Post: {
              screen: HomeScreen,
              navigationOptions: {
                tabBarIcon: ({tintColor}) => <Ionicons name='ios-add-circle' size={48} color='#E9446A'
                                                       style={{
                                                         shadowColor: '#E9446A',
                                                         shadowOffset: {width: 0, height: 0},
                                                         shadowRadius: 10,
                                                         shadowOpacity: 0.3
                                                       }}/>
              }
            },
            Notification: {
              screen: HomeScreen,
              navigationOptions: {
                tabBarIcon: ({tintColor}) => <Ionicons name='ios-notifications' size={24} color={tintColor}/>
              }
            },
            Profile: {
              screen: HomeScreen,
              navigationOptions: {
                tabBarIcon: ({tintColor}) => <Ionicons name='ios-person' size={24} color={tintColor}/>
              }
            }
          },
          {
            defaultNavigationOptions: {
              tabBarOnPress: ({navigation, defaultHandler}) => {
                if (navigation.state.key === 'Post') {
                  navigation.navigate('postModal')
                } else {
                  defaultHandler()
                }
              }
            }
          },
          {
            tabBarOptions: {
              activeTintColor: 'black',
              inactiveTintColor: '#a8a8a8',
              showLabel: false
            }
          }),
      postModal: {
        screen: HomeScreen
      }
    },
    {
      mode: 'modal',
      headerMode: 'none',
      //initialRouteName:'postModal'
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
          initialRouteName: "App"
        }
    )
);