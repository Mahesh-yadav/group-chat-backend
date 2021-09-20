import { db } from '../db/connection';

export default class User {
  static collectionName = 'users';

  static async getUserById(id) {
    const database = db.getDb();

    const user = await database.collection(User.collectionName).findOne({ id });

    return user;
  }
}
