import { User } from "../../models/user.model.js";
import { HttpResponse } from "../protocols.js";

export interface IGetUsersController {
    handle(): Promise<HttpResponse<User[]>>;
}

export interface IGetUsersRepository {
    getUsers(): Promise<User[]>;
}

