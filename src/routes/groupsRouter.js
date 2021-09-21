import express from 'express';
import Group from '../models/Group';
import * as firebase from 'firebase-admin';
import Request from '../models/Request';
import Message from '../models/Message';

const router = express();

router.get('/', async (req, res, next) => {
  try {
    const groups = await Group.getAllGroups();
    res.json(groups);
  } catch (error) {
    next(error);
  }
});

router.get('/:groupId', async (req, res, next) => {
  try {
    const token = req.headers.authtoken;
    const { groupId } = req.params;

    if (!token) {
      return res.status(401).json({ message: 'Not Authorized' });
    }

    const user = await firebase.auth().verifyIdToken(token);

    if (!user) {
      return res.status(401).json({ message: 'Not Authorized' });
    }

    const group = await Group.getGroup(groupId);

    if (group.ownerId === user.user_id) {
      // User is group owner
      const ownerPopulatedGroup = await Group.getOwnerPopulatedGroup(groupId);
      res.json(ownerPopulatedGroup);
    } else if (group.members.includes(user.user_id)) {
      // User is group member
      const memberPopulatedGroup = await Group.getMemberPopulatedGroup(groupId);
      res.json(memberPopulatedGroup);
    } else {
      res.json(group);
    }
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
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

router.post('/:groupId/requests/:requestId/accept', async (req, res, next) => {
  try {
    const token = req.headers.authtoken;
    const { groupId, requestId } = req.params;

    if (!token) {
      return res.status(401).json({ message: 'Not Authorized' });
    }

    const user = await firebase.auth().verifyIdToken(token);
    const group = await Group.getGroup(groupId);

    if (!user || group.ownerId !== user.user_id) {
      return res.status(401).json({ message: 'Not Authorized' });
    }

    await Request.acceptRequest(requestId);

    const updatedRequests = await Request.getRequestsByGroupId(groupId);

    res.json(updatedRequests);
  } catch (error) {
    next(error);
  }
});

router.post('/:groupId/requests/:requestId/reject', async (req, res, next) => {
  try {
    const token = req.headers.authtoken;
    const { groupId, requestId } = req.params;

    if (!token) {
      return res.status(401).json({ message: 'Not Authorized' });
    }

    const user = await firebase.auth().verifyIdToken(token);
    const group = await Group.getGroup(groupId);

    if (!user || group.ownerId !== user.user_id) {
      return res.status(401).json({ message: 'Not Authorized' });
    }

    await Request.rejectRequest(requestId);

    const updatedRequests = await Request.getRequestsByGroupId(groupId);

    res.json(updatedRequests);
  } catch (error) {
    next(error);
  }
});

router.post('/:groupId/messages', async (req, res, next) => {
  try {
    const token = req.headers.authtoken;
    const { groupId } = req.params;
    const { text } = req.body;

    if (!token) {
      return res.status(401).json({ message: 'Not Authorized' });
    }

    const user = await firebase.auth().verifyIdToken(token);
    const group = await Group.getGroup(groupId);

    if (!user || !group.members.includes(user.user_id)) {
      return res.status(401).json({ message: 'Not Authorized' });
    }

    await Message.addMessageToGroup(groupId, user.user_id, text);

    const updatedMessages = await Message.getMessageByGroupId(groupId);

    res.json(updatedMessages);
  } catch (error) {
    next(error);
  }
});

export default router;
