import { ObjectId } from "mongodb";
import {
  IUpdateUserRepository,
  UpdateUserParams,
} from "../../controllers/updateUsers/protocols.js";
import { MongoClient } from "../../database/mongo.js";
import { User } from "../../models/user.model.js";
import * as argon2 from 'argon2';

export class MongoUpdateUserRepository implements IUpdateUserRepository {
  async updateUser(id: string, params: UpdateUserParams): Promise<User> {

    if (params.username) {
      const existingUser = await MongoClient.db
        .collection<Omit<User, "id">>("users")
        .findOne({
          username: { $regex: `^${params.username.toLocaleLowerCase()}$`, $options: "i" },
          _id: { $ne: new ObjectId(id) }
        });

      if (existingUser) {
        throw new Error("Username already exists");
      }
    }

    const updateData: any = { ...params };
    if (params.password) {
      try {
        updateData.password = await argon2.hash(params.password, {
          type: argon2.argon2id,
          memoryCost: 2 ** 16,
          timeCost: 3,
          parallelism: 1
        });
      } catch (error) {
        throw new Error("Failed to hash password");
      }
    }

    await MongoClient.db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: updateData,
      }
    );
    const user = await MongoClient.db
      .collection<Omit<User, "id">>("users")
      .findOne({ _id: new ObjectId(id) });

    if (!user) {
      throw new Error("The user has not been updated correctly");
    }

    const { _id, ...rest } = user;

    return { id: _id.toHexString(), ...rest };
  }
}
