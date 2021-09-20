import express from 'express';
import Group from '../models/Group';
import * as firebase from 'firebase-admin';
import Request from '../models/Request';

const router = express();

router.get('/', async (req, res, next) => {
  try {
    const groups = await Group.getAllGroups();
    res.json(groups);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    console.log(req.body);
    const token = req.headers.authtoken;
    const { name } = req.body;

    if (!token) {
      return res.status(401).json({ message: 'Not Authorized' });
    }

    const { user_id } = await firebase.auth().verifyIdToken(token);

    if (!user_id) {
      return res.status(401).json({ message: 'Not Authorized' });
    }

    const newGroupId = await Group.createGroup(name, user_id);
    console.log(newGroupId);
    res.status(201).json({ newGroupId });
  } catch (error) {
    next(error);
  }
});

router.post('/:groupId/join-request', async (req, res, next) => {
  try {
    const token = req.headers.authtoken;
    const { groupId } = req.params;

    if (!token) {
      return res.status(401).json({ message: 'Not Authorized' });
    }

    const { user_id } = await firebase.auth().verifyIdToken(token);

    if (!user_id) {
      return res.status(401).json({ message: 'Not Authorized' });
    }

    await Request.createGroupJoinRequest(groupId, user_id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
