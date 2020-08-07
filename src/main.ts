import App from "./App.svelte";
import "./main.css";

import * as firebase from "./common/firebase";
firebase.init();

const app = new App({
  target: document.body,
});

export default app;
