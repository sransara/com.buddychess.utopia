import { dbrest } from "../../common/firebase";
import * as msgbus from "../../common/msgbus";
import * as wizard from "../../common/wizard";
import * as utils from "../../common/utils";
import * as errors from "../../common/errors";
import { EventBusSingleton as EventBus } from "light-event-bus";
import SimplePeer from "simple-peer/simplepeer.min.js";

export async function initPeerKey(players: any, roomId: string, peerId: string) {
  if ("publicKey" in players[peerId]) return;
  let response = await dbrest(`rooms/${roomId}/players/${peerId}.json`);
  if (!response.ok) {
    console.log(response.status);
    return errors.fatal(errors.fatalEnum.FIRESTORE_ERROR);
  }
  let json = await response.json();
  if (!json) throw new Error("Player not found.");
  Object.assign(players[peerId], json);
}

const webrtcConfig = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

export function peerConnectionCleanup(players: any, peerId: string) {
  if (peerId in players == false) return;
  if (players[peerId]["peerConnected"] == false) return;
  players[peerId]["peerConnected"] = false;
  players[peerId]["peerConnectionListenBeats"].stop();
  players[peerId]["peerConnectionSendBeats"].stop();
  players[peerId]["peerConnection"].destroy();
  delete players[peerId];
  EventBus.publish("simplePeerClose", peerId);
}

export function setupPeerConnection(players: any, roomId: string, myId: string, peerId: string) {
  if ("peerConnection" in players[peerId]) return;

  msgbus.send(players, roomId, myId, peerId, "initPeerConnection", {});

  let peerConnection = (players[peerId]["peerConnection"] = new SimplePeer({
    initiator: myId > peerId,
    config: webrtcConfig,
  }));
  players[peerId]["peerConnected"] = false;

  peerConnection.on("signal", (data: any) => {
    msgbus.send(players, roomId, myId, peerId, "simplePeerSignal", data);
  });

  peerConnection.on("close", () => {
    peerConnectionCleanup(players, peerId);
  });

  peerConnection.on("error", (err: any) => {
    if (players[peerId]["peerConnected"]) peerConnectionCleanup(players, peerId);
    EventBus.publish("simplePeerError", {
      peer: peerId,
      error: err,
    });
  });

  players[peerId]["peerConnectionListenBeats"] = new utils.IntervalTimer(() => {
    peerConnectionCleanup(players, peerId);
  }, 30000);

  players[peerId]["peerConnectionSendBeats"] = new utils.IntervalTimer(() => {
    msgbus.send(players, roomId, myId, peerId, "heartbeat", {});
  }, 5000);

  return new Promise<void>((resolve) => {
    peerConnection.on("connect", () => {
      players[peerId]["peerConnected"] = true;
      msgbus.dataChannelListen(players, peerId, myId);
      resolve();
    });
  });
}

export function allSpotsInSync(spots: any, wiz: wizard.types.wizard, gamen: number) {
  const pids = Object.keys(spots);
  if (pids.length < 4) {
    return false;
  }

  const gamens = pids.map((pid) => spots[pid]["gamen"]);
  if (!gamens.every((v) => v === gamen)) {
    return false;
  }

  const wizards = pids.map((pid) => spots[pid]["wizard"]);
  if (!wizards.every((v) => wizard.equals(v, wiz))) {
    return false;
  }

  return true;
}
