import React from 'react';
import PushNotification from "react-native-push-notification";

export default class PushController extends React.Component{
    componentDidMount() {
        PushNotification.configure({
            onRegister: function(token){
                console.log("TOKEN:", token)
            },
            onNotification: function(notification){
                console.log("NOTIFICATION:", notification)
                //notification.finish(PushNotificationIOS.FetchResult.NoData)
            },
            senderID:"741967739341",
     /*       permissions:{
                alert:true,
                badge:true,
                sound:true
            },*/
            popInitialNotification: true,
            requestPermissions: true
        })
    }
    render(){
        return null
    }
}