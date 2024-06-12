import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';


const firebaseConfig = {
  apiKey: "AIzaSyDPWyc07TZA4PhcHrqCBC0imm7jdFrIbMI",
  authDomain: "qwiki-cb7df.firebaseapp.com",
  databaseURL: "https://qwiki-cb7df-default-rtdb.firebaseio.com",
  projectId: "qwiki-cb7df",
  storageBucket: "qwiki-cb7df.appspot.com",
  messagingSenderId: "427941826541",
  appId: "1:427941826541:android:4d7e6c1fce4ef210daa1e4"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default database;