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

    getOrder=setOpenOrders=>{
        this.firestore
            .collection("orders")
            .where('openOrder', '==', true)
            .get()
            .then((snapshot)=>{
                const orders=snapshot.map(doc=>{
                    return doc.data()
                })
                setOpenOrders(orders)
                /*let orders=[];
                    snapshot.forEach(doc=>{
                        orders.push(doc.data());
                        setOpenOrders(orders)
                    })*/
            })
//            .on("child_added",snapshot=>setCoords(this.parse(snapshot)))
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