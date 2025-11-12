import { User } from "../../models/user.model.js";

export interface UpdateUserParams {
    username?: string;
    password?: string
}

export interface IUpdateUserRepository {
    updateUser(id: string, params: UpdateUserParams): Promise<User>
}