import firebase from "firebase";

const app = firebase.initializeApp({
  apiKey: "K6NsBpd5j4Lf3bBnJVjC299AeRNTdZnTSJgyzesq",
  databaseURL: "https://desafio-dwf-m6-default-rtdb.firebaseio.com",
  authDomain: "desafio-dwf-m6.firebaseapp.com",
});

const rtdb = firebase.database();

export { rtdb };
