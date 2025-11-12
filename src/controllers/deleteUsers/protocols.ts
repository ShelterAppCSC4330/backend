import { User } from "../../models/user.model.js";
import { HttpRequest, HttpResponse } from "../protocols.js";

export interface IDeleteUserController {
  handle(httpRequest: HttpRequest<any>): Promise<HttpResponse<User>>;
}

export interface IDeleteUserRepository {
  deleteUser(id: string): Promise<User>;
}
