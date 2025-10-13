import { CreateUserParams, ICreateUserRepository } from "../../controllers/CreateUsers/protocols.js";
import { MongoClient } from "../../database/mongo.js";
import { User } from "../../models/user.model.js";

export class MongoCreateUserRepository implements ICreateUserRepository {
    async createUser(params: CreateUserParams): Promise<User> {
        // here the user is created
        const { insertedId } = await MongoClient.db
            .collection('users')
            .insertOne(params);
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