import {firebaseConfig} from "./config";
import firebase from "firebase";

class Fire {
    constructor() {
        firebase.initializeApp(firebaseConfig);
    }

    addOrder = async ({ transportCardChoice,
                          distance,
                          coords,
                          addressFromInput,
                          coordsFrom,
                          addressToInput,
                          coordsTo,
                          addInfo,
                          openOrder,
                          completeOrder }) => {

        return new Promise((res, rej) => {
            this.firestore
                .collection("orders")
                .add({
                    transportCardChoice,
                    distance,
                    coords,
                    addressFromInput,
                    coordsFrom,
                    addressToInput,
                    coordsTo,
                    addInfo,
                    openOrder,
                    completeOrder,
                    uid: this.uid,
                    timestamp: this.timestamp
                })
                .then(ref => {
                    res(ref);
                })
                .catch(error => {
                    rej(error);
                });
        });
    }

    deleteOrder = async ({ id }) => {

        return new Promise((res, rej) => {
            this.firestore
                .collection("orders")
                .doc(id)
                .delete()
                .then(ref => {
                    res(ref);
                })
                .catch(error => {
                    rej(error);
                });
        });
    }

    parse=order=>{
        const {transportCardChoice,
            distance,
            coords,
            addressFromInput,
            coordsFrom,
            addressToInput,
            coordsTo,
            addInfo,
            openOrder,
            completeOrder,
            uid,
            timestamp} = order.val();
        const {key: _id}=order;
        const createdAt=new Date(timestamp);

        return {
            _id,
            createdAt,
            transportCardChoice,
            distance,
            coords,
            addressFromInput,
            coordsFrom,
            addressToInput,
            coordsTo,
            addInfo,
            openOrder,
            completeOrder,
            uid
        }
    }

    getOrder=setCoords=>{
        this.firestore
            .collection("orders")
            .where('openOrder', '==', 'true')
            .get()
            .then((snapshot)=>{

                    setCoords(snapshot)
            })
 //           .on("child_added",snapshot=>console.log(this.parse(snapshot)))
    }


    createUser = async user => {
        let remoteUri = null;

        try {
            await firebase.auth().createUserWithEmailAndPassword(user.email, user.password);

            let db = this.firestore.collection("usersMyUber").doc(this.uid);

            db.set({
                name: user.name,
                email: user.email,
            });

        } catch (error) {
            alert("Error: ", error);
        }
    };

    signOut = () => {
        firebase.auth().signOut();
    };

    get firestore() {
        return firebase.firestore();
    }

    get uid() {
        return (firebase.auth().currentUser || {}).uid;
    }

    get timestamp() {
        return Date.now();
    }
}

Fire.shared = new Fire();
export default Fire;