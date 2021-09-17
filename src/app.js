import express from 'express';
import morgan from 'morgan';
import * as firebase from 'firebase-admin';
import firebaseCredentials from '../firebase-credentials.json';

firebase.initializeApp({
  credential: firebase.credential.cert(firebaseCredentials),
});

const app = express();

// Logging middleware
app.use(morgan('dev'));

// JSON req body parser middleware
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello!');
});

export default app;
