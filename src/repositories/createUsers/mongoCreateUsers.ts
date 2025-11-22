import { CreateUserParams, ICreateUserRepository } from "../../controllers/createUsers/protocols.js";
import { MongoClient } from "../../database/mongo.js";
import { User } from "../../models/user.model.js";
import * as argon2 from "argon2";

export class MongoCreateUserRepository implements ICreateUserRepository {
    async createUser(params: CreateUserParams): Promise<User> {
        // verify if user already exist
        const username = params.username.toLocaleLowerCase();
        if (username) {
          const existingUser = await MongoClient.db
            .collection<Omit<User, "id">>("users")
            .findOne({
              username: { $regex: `^${username}$`, $options: "i" },
            });

          if (existingUser) {
            throw new Error("Username already exists");
          }
        }
        // hash passwd
        let passwordHash: string;
        try {
          passwordHash = await argon2.hash(params.password, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 1
          });
        } catch (error) {
          throw new Error("Failed to hash password");
        }
        const userDocument = { username: params.username, password: passwordHash };
        // here the user is created
        const { insertedId } = await MongoClient.db
            .collection('users')
            .insertOne(userDocument);
        // to verify if user was created
        const user = await MongoClient.db
            .collection<Omit<User, "id">>('users')
            .findOne({_id: insertedId});
        // if it wasnt created, throw err
        if (!user) {
            throw new Error('User not created')
        }

        const { _id, ...rest } = user;

        return { id: _id.toHexString(), ...rest };
    }
}