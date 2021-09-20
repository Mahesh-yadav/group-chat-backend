import { v4 as uuid } from 'uuid';
import { db } from '../db/connection';
import User from './User';

export default class Group {
  static collectionName = 'groups';

  static async getAllGroups() {
    const database = db.getDb();

    const groups = await database
      .collection(Group.collectionName)
      .find({})
      .toArray();

    const groupOwners = await Promise.all(
      groups.map((group) => User.getUserById(group.ownerId))
    );

    const populatedGroups = groups.map((group) => ({
      ...group,
      owner: groupOwners.find((owner) => owner.id === group.ownerId),
    }));

    return populatedGroups;
  }

  static async getUserGroups(userId) {
    const database = db.getDb();
    const groups = await database
      .collection(Group.collectionName)
      .find({ members: userId })
      .toArray();

    const groupOwners = await Promise.all(
      groups.map((group) => User.getUserById(group.ownerId))
    );

    const populatedGroups = groups.map((group) => ({
      ...group,
      owner: groupOwners.find((owner) => owner.id === group.ownerId),
    }));

    return populatedGroups;
  }

  static async createGroup(name, userId) {
    const newGroupId = uuid();

    const database = db.getDb();
    await database.collection(Group.collectionName).insertOne({
      id: newGroupId,
      name,
      ownerId: userId,
      members: [userId],
    });

    return newGroupId;
  }
}
