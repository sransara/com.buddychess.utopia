import * as firebase from "firebase/app";
import { encrypt, decrypt } from "./crypto";
import { EventBusSingleton as EventBus } from "light-event-bus";

let firestoreMsgBusUnsubscriber: any;

export function firestoreMsgBusUnsubscribe() {
  if (firestoreMsgBusUnsubscriber) firestoreMsgBusUnsubscriber();
}

export function firestoreMsgBusListen(roomId: string, toId: string, toSecretKey: Uint8Array) {
  firestoreMsgBusUnsubscribe();
  firestoreMsgBusUnsubscriber = firebase
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

function firestoreMsgBusSend(
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

export function dataChannelMsgBusListen(players: any, fromId: string, myId: string) {
  (players[fromId]["dataChannel"] as RTCDataChannel).addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if (msg["to"] == myId) {
      EventBus.publish(msg.method, msg);
    } else {
      dataChannelMsgBusSend(players, msg["to"], msg["from"], msg["to"], msg["method"], msg["payload"]);
    }
  });
}

function dataChannelMsgBusSend(
  players: any,
  proxyId: string,
  fromId: string,
  toId: string,
  method: string,
  payload: any
) {
  if (!players[proxyId] || !players[proxyId]["dataChannel"]) return;

  (players[proxyId]["dataChannel"] as RTCDataChannel).send(
    JSON.stringify({
      from: fromId,
      to: toId,
      method: method,
      payload: payload,
    })
  );
}

export function msgBusSend(players: any, roomId: string, fromId: string, toId: string, method: string, payload: any) {
  if (fromId == toId) return;
  if (players[toId]["dataChannel"] && players[toId]["dataChannel"].readyState == "open") {
    dataChannelMsgBusSend(players, toId, fromId, toId, method, payload);
  } else if (players["host"]["dataChannel"]) {
    // && players["host"]["dataChannel"].readyState == "open") {
    dataChannelMsgBusSend(players, "host", fromId, toId, method, payload);
  } else {
    firestoreMsgBusSend(roomId, fromId, toId, players[toId]["publicKey"], method, payload);
  }
}
