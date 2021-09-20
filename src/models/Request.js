import { db } from '../db/connection';
import { v4 as uuid } from 'uuid';

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
}
