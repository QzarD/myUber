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

    delete = ({id}) => {
        let deleteDoc = this.firestore.collection('orders').doc(id).delete();
        return deleteDoc.then(res => {
            console.log('Delete: ', res);
        });
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