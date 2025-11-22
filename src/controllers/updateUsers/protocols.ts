import { User } from "../../models/user.model.js";
import { HttpRequest, HttpResponse } from "../protocols.js";

export interface UpdateUserParams {
  username?: string;
  password?: string;
}

export interface IUpdateUserController {
  handle(httpRequest: HttpRequest<any>): Promise<HttpResponse<User>>;
}

export interface IUpdateUserRepository {
  updateUser(id: string, params: UpdateUserParams): Promise<User>;
}