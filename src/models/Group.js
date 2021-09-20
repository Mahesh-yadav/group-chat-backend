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
}
