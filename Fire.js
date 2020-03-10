import {firebaseConfig} from "./config";
import firebase from "firebase";

class Fire {
    constructor() {
        firebase.initializeApp(firebaseConfig);
    }

    addOrder = async ({
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
                          driverWaiting
                      }) => {

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
                    driverWaiting,
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

    deleteOrder = async ({id}) => {

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

    getOrder = setOpenOrders => {
        this.firestore
            .collection("orders")
            .where('openOrder', '==', true)
            .get()
            .then((snapshot) => {
                const orders = snapshot.map(doc => {
                    return doc.data()
                })
                setOpenOrders(orders)
            })
    }


    createUser = async user => {
        let remoteUri = null;

        try {
            await firebase.auth().createUserWithEmailAndPassword(user.email, user.password);

            let db = this.firestore.collection("users").doc(this.uid);

            db.set({
                name: user.name,
                email: user.email,
            });

        } catch (error) {
            alert("Error: ", error);
        }
    };

    getUserInfo = (e) => {
        this.firestore.collection("users").doc(this.uid).get()
            .then(doc => {
                if (!doc.exists) {
                    console.log('No such document!');
                } else {
                    e(doc.data())
                }
            })
            .catch(err => {
                console.log('Error getting document', err);
            });
    };
    sendRating = (id, rating) => {
        const userRef=this.firestore.collection("users").doc(id)
        userRef.get()
            .then((doc) => {
                let data = doc.data().rating
                if (data.length < 40) {
                    data.push(rating)
                    userRef.update({
                        rating:data
                    })
                } else {
                    data.shift()
                    data.push(rating)
                    userRef.update({
                        rating:data
                    })
                }
            })
            .catch(err => {
                console.log('Error getting document', err);
            });
    };

    checkOrder = async ({id}) => {

        return new Promise((res, rej) => {
            this.firestore
                .collection("orders")
                .doc(id)
                .get()
                .then(ref => {
                    res(ref.data());
                })
                .catch(error => {
                    rej(error);
                });
        });
    }

    getToken = (e) => {
        firebase.database().ref('users/').on('value', function (snapshot) {
            console.log(snapshot.val())
        })
    }

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