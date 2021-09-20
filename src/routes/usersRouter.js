import express from 'express';
import * as firebase from 'firebase-admin';
import Group from '../models/Group';
import Request from '../models/Request';

const router = express();

router.get('/:userId/groups', async (req, res, next) => {
  try {
    const token = req.headers.authtoken;
    const { userId } = req.params;

    if (!token) {
      return res.status(401).json({ message: 'Not Authorized' });
    }

    const { user_id } = await firebase.auth().verifyIdToken(token);

    if (!user_id || user_id !== userId) {
      return res.status(401).json({ message: 'Not Authorized' });
    }

    const userGroups = await Group.getUserGroups(userId);
    res.json(userGroups);
  } catch (error) {
    next(error);
  }
});

router.get('/:userId/requests', async (req, res, next) => {
  try {
    const token = req.headers.authtoken;
    const { userId } = req.params;

    if (!token) {
      return res.status(401).json({ message: 'Not Authorized' });
    }

    const { user_id } = await firebase.auth().verifyIdToken(token);

    if (!user_id || user_id !== userId) {
      return res.status(401).json({ message: 'Not Authorized' });
    }

    const requests = await Request.getAllGroupRequestsByUser(userId);

    res.json(requests);
  } catch (error) {
    next(error);
  }
});

export default router;
