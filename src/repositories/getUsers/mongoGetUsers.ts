import { IGetUsersRepository } from "../../controllers/GetUsers/protocols.js";
import { User } from "../../models/user.model.js";

export class MongoGetUsersRepository implements IGetUsersRepository {
    async getUsers(): Promise<User[]> {
        return [
            {
                username: 'user1',
                password: 'pass123',
            },
        ];
    }
}