import { box, randomBytes } from "tweetnacl";

import { decodeUTF8, encodeUTF8, encodeBase64, decodeBase64 } from "tweetnacl-util";

// prettier-ignore
const buddyChessPseudoPK = Uint8Array.from([120,180,156,202,205,250,67,107,156,224,96,51,152,216,221,81,135,173,64,140,228,88,75,235,80,234,249,7,55,111,179,89,]);
// prettier-ignore
const buddyChessPseudoSK = Uint8Array.from([113,109,133,216,29,154,30,239,165,44,165,130,112,83,45,172,9,72,53,119,45,171,21,195,162,219,93,222,245,158,122,170,]);

export const encrypt = (recieverPublicKeyB64: string, payload: string): string => {
  const recieverPublicKey = decodeBase64(recieverPublicKeyB64);

  const nonce = randomBytes(box.nonceLength);
  const payloadBytes = decodeUTF8(payload);
  const encryptedPayloadBytes = box(payloadBytes, nonce, recieverPublicKey, buddyChessPseudoSK);

  const wrappedEncryptedPayloadBytes = new Uint8Array(box.nonceLength + encryptedPayloadBytes.length);
  wrappedEncryptedPayloadBytes.set(nonce);
  wrappedEncryptedPayloadBytes.set(encryptedPayloadBytes, nonce.length);

  return encodeBase64(wrappedEncryptedPayloadBytes);
};

export const decrypt = (recieverSecretKey: Uint8Array, wrappedEncryptedPayloadB64: string) => {
  const wrappedEncryptedPayloadBytes = decodeBase64(wrappedEncryptedPayloadB64);
  const nonce = wrappedEncryptedPayloadBytes.slice(0, box.nonceLength);
  const encryptedPayloadBytes = wrappedEncryptedPayloadBytes.slice(
    box.nonceLength,
    wrappedEncryptedPayloadBytes.length
  );

  const decryptedPayloadBytes = box.open(encryptedPayloadBytes, nonce, buddyChessPseudoPK, recieverSecretKey);

  if (!decryptedPayloadBytes) {
    throw new Error("Could not decrypt message");
  }

  return encodeUTF8(decryptedPayloadBytes);
};

const myKeypair = box.keyPair();
export const myPublicKey = encodeBase64(myKeypair.publicKey);
export const mySecretKey = myKeypair.secretKey;

/*
const obj = { hello: 'world' };
const pairA = box.keyPair();
const encrypted = encrypt(pairA.publicKey, obj);
const decrypted = decrypt(pairA.secretKey, encrypted);
console.log(obj, decrypted);
*/
