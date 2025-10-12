import { IGetUsersRepository } from "../../controllers/GetUsers/protocols.js";
import { MongoClient } from "../../database/mongo.js";
import { User } from "../../models/user.model.js";

export class MongoGetUsersRepository implements IGetUsersRepository {
    async getUsers(): Promise<User[]> {
        const users = await MongoClient.db
            .collection<Omit<User, "id">>('users')
            .find({})
            .toArray();

        return users.map(({_id, ...rest}) => ({
            id: _id.toHexString(),
            ...rest
        }));
    }
}