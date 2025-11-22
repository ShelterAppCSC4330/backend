import { User } from "../../models/user.model.js";
import { HttpRequest, HttpResponse } from "../protocols.js";
import { IDeleteUserController, IDeleteUserRepository } from "./protocols.js";

export class DeleteUserController implements IDeleteUserController {
  constructor(private readonly deleteUserRepository: IDeleteUserRepository) {}

  async handle(httpRequest: HttpRequest<any> & { user?: any }): Promise<HttpResponse<User>> {
    try {
      const id = httpRequest?.params?.id;
      const requestingUser = httpRequest.user;

      if (!id) {
        return {
          statusCode: 400,
          body: "Missing user id.",
        };
      }

      if (!requestingUser) {
        return {
          statusCode: 401,
          body: "Authentication required"
        };
      }

      if (requestingUser.userId !== id) {
        return {
          statusCode: 403,
          body: "Not authorized to update this user"
        }
      }

      const user = await this.deleteUserRepository.deleteUser(id);
      return {
        statusCode: 200,
        body: user,
      }
    } catch (error) {
      return {
        statusCode: 500,
        body: "Something went wrong.",
      };
    }
  }
}
