import { dbrest } from "../../common/firebase";
import { dataChannelMsgBusListen, msgBusSend } from "../../common/msgbus";
import { EventBusSingleton as EventBus } from "light-event-bus";

type wizardStep = { currStep: number; currStepStatus: "todo" | "doing" };
export function wizardNextStep({ currStep, currStepStatus }: wizardStep): wizardStep {
  if (currStepStatus == "todo") {
    return { currStep: currStep, currStepStatus: "doing" };
  }
  // else if (currStepStatus == "doing")
  return { currStep: currStep + 1, currStepStatus: "todo" };
}

export function wizardBackStep({ currStep, currStepStatus }: wizardStep): wizardStep {
  if (currStepStatus == "todo") {
    return { currStep: currStep - 1, currStepStatus: "doing" };
  }
  // else if (currStepStatus == "doing")
  return { currStep: currStep, currStepStatus: "todo" };
}

export async function validatePlayer(players: any, roomId: string, playerId: string) {
  if (players[playerId] && players[playerId]["publicKey"]) return;
  let response = await dbrest(`rooms/${roomId}/players/${playerId}.json`);
  if (!response.ok) throw new Error(`${response.status}`);
  let json = await response.json();
  if (!json) throw new Error("Player not found.");
  if (players[playerId]) {
    Object.assign(players[playerId], json);
  } else {
    players[playerId] = json;
  }
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

export function setupPeerConnection(players: any, roomId: string, myId: string, peerId: string) {
  if (!players[peerId]) players[peerId] = {};
  const peer = players[peerId];
  let peerConnection = (peer["peerConnection"] = new RTCPeerConnection(configuration));
  registerPeerConnectionListeners(peerConnection, peerId);
  msgBusSend(players, roomId, myId, peerId, "initPeerConnection", {});

  let polite = myId < peerId;
  let makingOffer = false;

  async function createOffer(options: any) {
    try {
      makingOffer = true;
      const offer = await peerConnection.createOffer(options);
      if (peerConnection.signalingState != "stable") return;
      await peerConnection.setLocalDescription(offer);
      msgBusSend(players, roomId, myId, peerId, "withSessionDescription", peerConnection.localDescription);
    } finally {
      makingOffer = false;
    }
  }

  peerConnection.addEventListener("negotiationneeded", createOffer);

  peerConnection.addEventListener("iceconnectionstatechange", async () => {
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
      msgBusSend(players, roomId, myId, peerId, "withSessionDescription", peerConnection.localDescription);
    }
  });

  peerConnection.addEventListener("icecandidate", (event: any) => {
    if (!event.candidate) return;
    msgBusSend(players, roomId, myId, peerId, "addIceCandidate", event.candidate);
  });

  EventBus.subscribe("addIceCandidate", async (arg: any) => {
    if (arg.from != peerId) return;
    await peerConnection.addIceCandidate(new RTCIceCandidate(arg.payload)).catch(() => {});
  });

  const dataChannel = peerConnection.createDataChannel("msgbus", { negotiated: true, id: 0 });
  return new Promise((resolve) => {
    dataChannel.addEventListener("close", (event) => {
      delete players[peerId]["peerConnection"];
      EventBus.publish("deletePlayer", peerId);
    });

    dataChannel.addEventListener("open", (event) => {
      peer["dataChannel"] = dataChannel;
      dataChannelMsgBusListen(players, peerId, myId);
      resolve();
    });
  });
}

export function getattr(obj: any, path: string[]) {
  return path.reduce((acc, cur) => acc[cur], obj);
}
