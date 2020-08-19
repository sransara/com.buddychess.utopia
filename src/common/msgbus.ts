import * as firebase from "firebase/app";
import { encrypt, decrypt } from "./crypto";
import { EventBusSingleton as EventBus } from "light-event-bus";

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
    .onSnapshot((snapshot) => {
      snapshot.docChanges().forEach(function (change) {
        if (change.type === "added") {
          const msg = change.doc.data();
          msg["payload"] = JSON.parse(decrypt(toSecretKey, msg["payload"]));
          EventBus.publish(msg.method, msg);
        }
      });
    });
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
    });
}

export function dataChannelListen(players: any, fromId: string, myId: string) {
  players[fromId]["dataChannel"].addEventListener("message", (event: MessageEvent) => {
    players[fromId]["dataChannelListenBeats"].reset();
    const msg = JSON.parse(event.data);
    if (msg["to"] == myId) {
      EventBus.publish(msg.method, msg);
    } else {
      dataChannelSend(players, msg["to"], msg["from"], msg["to"], msg["method"], msg["payload"]);
    }
  });
}

function dataChannelSend(players: any, proxyId: string, fromId: string, toId: string, method: string, payload: any) {
  if ("dataChannel" in players[proxyId] == false) return;
  if (players[proxyId]["dataChannel"].readyState != "open") return;
  players[proxyId]["dataChannelSendBeats"].reset();
  players[proxyId]["dataChannel"].send(
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
  // console.log(players, fromId, toId, method);
  if ("dataChannel" in players[toId]) {
    //  && players[toId]["dataChannel"].readyState == "open"
    dataChannelSend(players, toId, fromId, toId, method, payload);
  } else if ("dataChannel" in players["host"]) {
    // && players["host"]["dataChannel"].readyState == "open"
    dataChannelSend(players, "host", fromId, toId, method, payload);
  } else {
    firestoreSend(roomId, fromId, toId, players[toId]["publicKey"], method, payload);
  }
}

export function sendAll(players: any, roomId: string, fromId: string, toIds: string[], method: string, payload: any) {
  toIds.forEach((toId) => {
    if (toId == fromId) return;
    send(players, roomId, fromId, toId, method, payload);
  });
}
