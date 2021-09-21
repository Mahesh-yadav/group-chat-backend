import { db } from '../db/connection';
import User from './User';

export default class Message {
  static collectionName = 'messages';

  static async getMessageByGroupId(groupId) {
    const database = db.getDb();
    const messages = await database
      .collection(Message.collectionName)
      .find({ groupId })
      .toArray();

    const usersForMessages = await Promise.all(
      messages.map((message) => User.getUserById(message.userId))
    );

    const populatedMessages = messages.map((message, index) => ({
      ...message,
      userName: usersForMessages[index].fullName,
    }));

    return populatedMessages;
  }

  static async addMessageToGroup(groupId, userId, text) {
    const database = db.getDb();

    await database.collection(Message.collectionName).insertOne({
      text,
      userId,
      groupId,
    });
  }
}
