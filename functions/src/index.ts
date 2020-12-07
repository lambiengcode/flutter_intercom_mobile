import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

const db = admin.firestore();
const fcm = admin.messaging();

export const sendToDevice = functions.firestore
  .document("requests/{requestsID}")
  .onCreate(async (snapshot) => {
    const message = snapshot.data();

    const querySnapshot = await db
      .collection("users")
      .where("id", "==", message.receiveID)
      .get();

    const tokens = querySnapshot.docs.map((snap) => snap.data().token);

    const payload: admin.messaging.MessagingPayload = {
      notification: {
        title: "Admin",
        body: `Calling...`,
        icon: "your-icon-url",
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        sound: "../res/raw/calling.mp3",
        priority: "high",
      },
    };

    return fcm.sendToDevice(tokens, payload);
  });

export const sendToTopic = functions.firestore
  .document("notifications/{notificationsId}")
  .onCreate(async (snapshot) => {
    const notification = snapshot.data();

    const querySnapshot = await db
      .collection("users")
      .where("id", "in", notification.members)
      .get();

    const tokens = querySnapshot.docs.map((snap) => snap.data().token);

    const payload: admin.messaging.MessagingPayload = {
      notification: {
        title: `${notification.title}`,
        body: `${notification.body}`,
        image: `${notification.urlToImage}`,
        icon: "your-icon-url",
        click_action: "FLUTTER_NOTIFICATION_CLICK", // required only for onResume or onLaunch callbacks
        priority: "high",
      },
    };

    return fcm.sendToDevice(tokens, payload);
  });
