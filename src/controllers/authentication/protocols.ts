import { User } from "../../models/user.model.js";
import { HttpRequest, HttpResponse } from "../protocols.js";

export interface IAuthenticateUserController {
    handle(
        httpRequest: HttpRequest<AuthenticateUserParams>
    ): Promise<HttpResponse<string>>;
}

export interface AuthenticateUserParams {
    username: string;
    password: string;
}

export interface IAuthenticateUserRepository {
    findUser(params: AuthenticateUserParams): Promise<User>;
}