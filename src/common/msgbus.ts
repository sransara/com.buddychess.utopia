import firebase from "firebase/app";
import { encrypt, decrypt } from "./crypto";
import { EventBusSingleton as EventBus } from "light-event-bus";
import * as errors from "./errors";

let firestoreUnsubscriber: any;

export function firestoreUnsubscribe() {
  if (firestoreUnsubscriber) firestoreUnsubscriber();
}

export function firestoreListen(roomId: string, toId: string, toSecretKey: Uint8Array) {
  firestoreUnsubscribe();
  firestoreUnsubscriber = firebase
    .firestore()
    .collection("rooms")
    .doc(roomId)
    .collection("msgs")
    .where("to", "==", toId)
    .onSnapshot(
      (snapshot) => {
        snapshot.docChanges().forEach(function (change) {
          if (change.type === "added") {
            const msg = change.doc.data();
            msg["payload"] = JSON.parse(decrypt(toSecretKey, msg["payload"]));
            change.doc.ref.delete();
            EventBus.publish(msg.method, msg);
          }
        });
      },
      (err) => {
        console.log(err);
        return errors.fatal(errors.fatalEnum.FIRESTORE_ERROR);
      }
    );
}

function firestoreSend(
  roomId: string,
  fromId: string,
  toId: string,
  toPublicKey: string,
  method: string,
  payload: any
) {
  if (fromId == toId) return;
  firebase
    .firestore()
    .collection("rooms")
    .doc(roomId)
    .collection("msgs")
    .add({
      from: fromId,
      to: toId,
      method: method,
      payload: encrypt(toPublicKey, JSON.stringify(payload)),
    })
    .catch((err) => {
      console.log(err);
      return errors.fatal(errors.fatalEnum.FIRESTORE_ERROR);
    });
}

export function dataChannelListen(players: any, fromId: string, myId: string) {
  players[fromId]["peerConnection"].on("data", (data: any) => {
    players[fromId]["peerConnectionListenBeats"].reset();
    const msg = JSON.parse(data);
    if (msg["to"] == myId) {
      EventBus.publish(msg.method, msg);
    } else {
      dataChannelSend(players, msg["to"], msg["from"], msg["to"], msg["method"], msg["payload"]);
    }
  });
}

function dataChannelSend(players: any, proxyId: string, fromId: string, toId: string, method: string, payload: any) {
  players[proxyId]["peerConnectionSendBeats"].reset();
  players[proxyId]["peerConnection"].send(
    JSON.stringify({
      from: fromId,
      to: toId,
      method: method,
      payload: payload,
    })
  );
}

export function send(players: any, roomId: string, fromId: string, toId: string, method: string, payload: any) {
  if (fromId == toId) return;
  if (players[toId]["peerConnected"]) {
    dataChannelSend(players, toId, fromId, toId, method, payload);
  } else if (players["host"]["peerConnected"]) {
    dataChannelSend(players, "host", fromId, toId, method, payload);
  } else if (players[toId]["publicKey"]) {
    firestoreSend(roomId, fromId, toId, players[toId]["publicKey"], method, payload);
  }
}

export function sendAll(players: any, roomId: string, fromId: string, toIds: string[], method: string, payload: any) {
  toIds.forEach((toId) => {
    if (toId == fromId) return;
    send(players, roomId, fromId, toId, method, payload);
  });
}
