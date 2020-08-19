import firebase from "firebase/app";
import "firebase/firestore";

// just protection from any scrapers
function rot(s: string) {
  return s.replace(
    /[A-Z_\-:"|.}{]/gi,
    (c) =>
      'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm{}.|":-_'[
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-:"|.}{'.indexOf(c)
      ]
  );
}

export const firebaseConfig = JSON.parse(
  rot(
    "_|ncvXrl|.|NVmnFlOBv7}3g27{l7cy6iijc{USSqzlUyw97fZ|,|nhguQbznva|.|ohqql}purff}hgbcvn:sveronfrncc:pbz|,|qngnonfrHEY|.|uggcf.//ohqql}purff}hgbcvn:sveronfrvb:pbz|,|cebwrpgVq|.|ohqql}purff}hgbcvn|,|fgbentrOhpxrg|.|ohqql}purff}hgbcvn:nccfcbg:pbz|,|zrffntvatFraqreVq|.|389977316635|,|nccVq|.|1.389977316635.jro.27q73326783r7s0p3o87or|,|zrnfherzragVq|.|T}147MG5RY9W|-"
  )
);

export function init() {
  firebase.initializeApp(firebaseConfig);
}

export function dbrest(path: string, options?: any) {
  return fetch(`${firebaseConfig.databaseURL}/${path}`, options);
}
