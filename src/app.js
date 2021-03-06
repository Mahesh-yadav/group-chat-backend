import express from 'express';
import morgan from 'morgan';
import * as firebase from 'firebase-admin';
import firebaseCredentials from '../firebase-credentials.json';
import groupsRouter from './routes/groupsRouter';
import usersRouter from './routes/usersRouter';

firebase.initializeApp({
  credential: firebase.credential.cert(firebaseCredentials),
});

const app = express();

// Logging middleware
app.use(morgan('dev'));

// JSON req body parser middleware
app.use(express.json());

// Mount routers
app.use('/groups', groupsRouter);
app.use('/users', usersRouter);

export default app;
