import { User } from "../../models/user.model.js";
import { HttpRequest, HttpResponse } from "../protocols.js";
import {
  IUpdateUserController,
  IUpdateUserRepository,
  UpdateUserParams,
} from "./protocols.js";

export class UpdateUserController implements IUpdateUserController {
  constructor(private readonly updateUserRepository: IUpdateUserRepository) {}

  async handle(
    httpRequest: HttpRequest<any> & { user?: any }
  ): Promise<HttpResponse<User>> {
    try {
      const id = httpRequest?.params?.id;
      const body = httpRequest?.body;
      const requestingUser = httpRequest.user;

      if (!id) {
        return {
          statusCode: 500,
          body: "Missing user id",
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

      // In case we add more fields we need to state which are editable.
      const allowedFieldsToUpdate: (keyof UpdateUserParams)[] = [
        "username",
        "password",
      ];

      const someFieldIsNotAllowedToUpdate = Object.keys(body).some(
        (key) => !allowedFieldsToUpdate.includes(key as keyof UpdateUserParams)
      );

      if (someFieldIsNotAllowedToUpdate) {
        return {
          statusCode: 400,
          body: "Some received field is not allowed",
        };
      }

      const user = await this.updateUserRepository.updateUser(id, body);

      return {
        statusCode: 200,
        body: user,
      };
    } catch (error: any) {
      if (error.message === "Username already exists") {
        return {
          statusCode: 409,
          body: error.message,
        };
      }
      return {
        statusCode: 500,
        body: "Something went wrong.",
      };
    }
  }
}
