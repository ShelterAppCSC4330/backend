import { AuthenticateUserParams, IAuthenticateUserRepository } from "../../controllers/authentication/protocols.js";
import { MongoClient } from "../../database/mongo.js";
import { User } from "../../models/user.model.js";
import * as argon2 from "argon2";

export class MongoAuthenticateUserRepository implements IAuthenticateUserRepository {
    async findUser(params: AuthenticateUserParams): Promise<User> {
        const user = await MongoClient.db
            .collection<User>('users')
            .findOne({ username: params.username })
        if (!user) {
            throw new Error('User does not exist')
        }
        if (!await argon2.verify(user.password, params.password))
            throw new Error('Incorrect password')
        return user;
    }
}