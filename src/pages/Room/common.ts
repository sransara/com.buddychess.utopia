import { dbrest } from "../../common/firebase";
import * as msgbus from "../../common/msgbus";
import * as wizard from "../../common/wizard";
import { EventBusSingleton as EventBus } from "light-event-bus";

export async function initPeerKey(players: any, roomId: string, peerId: string) {
  if ("publicKey" in players[peerId]) return;
  let response = await dbrest(`rooms/${roomId}/players/${peerId}.json`);
  if (!response.ok) throw new Error(`${response.status}`);
  let json = await response.json();
  if (!json) throw new Error("Player not found.");
  Object.assign(players[peerId], json);
}

const configuration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:global.stun.twilio.com:3478?transport=udp"],
    },
  ],
  iceCandidatePoolSize: 2,
};

function registerPeerConnectionListeners(peerConnection: any, peerId: string) {
  peerConnection.addEventListener("icegatheringstatechange", () => {
    console.log(`${peerId} --> ICE gathering state changed: ${peerConnection.iceGatheringState}`);
  });
  peerConnection.addEventListener("connectionstatechange", () => {
    console.log(`${peerId} --> Connection state change: ${peerConnection.connectionState}`);
  });
  peerConnection.addEventListener("signalingstatechange", () => {
    console.log(`${peerId} --> Signaling state change: ${peerConnection.signalingState}`);
  });
  peerConnection.addEventListener("iceconnectionstatechange ", () => {
    console.log(`${peerId} --> ICE connection state change: ${peerConnection.iceConnectionState}`);
  });
}

class IntervalTimer {
  fn: () => void;
  time: number;
  timer: number | undefined;

  constructor(fn: () => void, time: number) {
    this.fn = fn;
    this.time = time;
    this.timer = setInterval(fn, time);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    return this;
  }

  start() {
    if (!this.timer) {
      this.stop();
      this.timer = setInterval(this.fn, this.time);
    }
    return this;
  }

  reset(newTime = this.time) {
    this.time = newTime;
    return this.stop().start();
  }
}

export function setupPeerConnection(players: any, roomId: string, myId: string, peerId: string) {
  const peer = players[peerId];
  let peerConnection = (peer["peerConnection"] = new RTCPeerConnection(configuration));
  registerPeerConnectionListeners(peerConnection, peerId);
  msgbus.send(players, roomId, myId, peerId, "initPeerConnection", {});

  let polite = myId < peerId;
  let makingOffer = false;

  async function createOffer(options: any) {
    try {
      makingOffer = true;
      const offer = await peerConnection.createOffer(options);
      if (peerConnection.signalingState != "stable") return;
      await peerConnection.setLocalDescription(offer);
      msgbus.send(players, roomId, myId, peerId, "withSessionDescription", peerConnection.localDescription);
    } finally {
      makingOffer = false;
    }
  }

  peerConnection.addEventListener("negotiationneeded", createOffer);

  peerConnection.addEventListener("iceconnectionstatechange", () => {
    if (peerConnection.iceConnectionState === "failed") {
      createOffer({ iceRestart: true });
    }
  });

  EventBus.subscribe("withSessionDescription", async (arg: any) => {
    if (arg.from != peerId) return;
    const description = arg.payload;
    const offerCollision = description.type == "offer" && (makingOffer || peerConnection.signalingState != "stable");
    if (!polite && offerCollision) return;
    if (offerCollision) {
      await Promise.all([
        // https://stackoverflow.com/a/61980233
        peerConnection.setLocalDescription({ type: "rollback" }),
        peerConnection.setRemoteDescription(description),
      ]);
    } else {
      await peerConnection.setRemoteDescription(description);
    }
    if (description.type == "offer") {
      await peerConnection.setLocalDescription(await peerConnection.createAnswer());
      msgbus.send(players, roomId, myId, peerId, "withSessionDescription", peerConnection.localDescription);
    }
  });

  peerConnection.addEventListener("icecandidate", (event: any) => {
    if (!event.candidate) return;
    msgbus.send(players, roomId, myId, peerId, "addIceCandidate", event.candidate);
  });

  EventBus.subscribe("addIceCandidate", async (arg: any) => {
    if (arg.from != peerId) return;
    await peerConnection.addIceCandidate(new RTCIceCandidate(arg.payload)).catch(() => {});
  });

  const dataChannel = peerConnection.createDataChannel("msgbus", { negotiated: true, id: 0 });

  function peerConnectionCleanup() {
    if (peerId in players == false) return;
    peerConnection.close();
    players[peerId]["dataChannelListenBeats"].stop();
    players[peerId]["dataChannelSendBeats"].stop();
    EventBus.publish("deletePlayer", peerId);
    delete players[peerId];
  }

  dataChannel.addEventListener("close", () => {
    peerConnectionCleanup();
  });

  peer["dataChannelListenBeats"] = new IntervalTimer(() => {
    dataChannel.close();
    peerConnectionCleanup();
  }, 30000);

  peer["dataChannelSendBeats"] = new IntervalTimer(() => {
    msgbus.send(players, roomId, myId, peerId, "heartbeat", {});
  }, 5000);

  return new Promise((resolve) => {
    dataChannel.addEventListener("open", (event) => {
      peer["dataChannel"] = dataChannel;
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
