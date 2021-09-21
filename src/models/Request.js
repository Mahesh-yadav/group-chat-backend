import { db } from '../db/connection';
import { v4 as uuid } from 'uuid';
import User from './User';
import Group from './Group';

export default class Request {
  static collectionName = 'requests';

  static async createGroupJoinRequest(groupId, userId) {
    const database = db.getDb();

    await database.collection(Request.collectionName).insertOne({
      id: uuid(),
      groupId,
      userId,
    });
  }

  static async getAllGroupRequestsByUser(userId) {
    const database = db.getDb();

    const requests = await database
      .collection(Request.collectionName)
      .find({ userId })
      .toArray();

    return requests;
  }

  static async getRequestsByGroupId(groupId) {
    const database = db.getDb();
    const requests = await database
      .collection(Request.collectionName)
      .find({ groupId })
      .toArray();

    const usersForRequests = await Promise.all(
      requests.map((request) => User.getUserById(request.userId))
    );

    const populatedRequests = requests.map((request, index) => ({
      ...request,
      userName: usersForRequests[index].fullName,
    }));

    return populatedRequests;
  }

  static async acceptRequest(requestId) {
    const database = db.getDb();

    const request = await database.collection(Request.collectionName).findOne({
      id: requestId,
    });

    await database.collection(Request.collectionName).deleteOne({
      id: requestId,
    });

    await database.collection(Group.collectionName).updateOne(
      {
        id: request.groupId,
      },
      {
        $push: { members: request.userId },
      }
    );
  }
  static async rejectRequest(requestId) {
    const database = db.getDb();
    await database.collection(Request.collectionName).deleteOne({
      id: requestId,
    });
  }
}
