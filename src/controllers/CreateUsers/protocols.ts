import { User } from "../../models/user.model.js";

export interface CreateUserParams {
    username: string;
    password: string;
}

export interface ICreateUserRepository {
    createUser(params: CreateUserParams): Promise<User>;
}