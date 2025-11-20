import { User } from "../../models/user.model.js";
import { HttpRequest, HttpResponse } from "../protocols.js";
import { CreateUserParams, ICreateUserController, ICreateUserRepository } from "./protocols.js";

export class CreateUserController implements ICreateUserController {
    constructor(private readonly createUserRepository: ICreateUserRepository) {}

    async handle(
        httpRequest: HttpRequest<CreateUserParams>
    ): Promise<HttpResponse<User>> {
        try {

            if (!httpRequest.body) {
                return {
                    statusCode: 400,
                    body: 'Please specify a body',
                }
            }

            const user = await this.createUserRepository.createUser(httpRequest.body);

            return {
                statusCode: 201,
                body: user,
            }
        } catch (error: any) {
            if (error.message === "Username already exists") {
                return {
                    statusCode: 409,
                    body: error.message,
                };
            }
            return {
                statusCode: 500,
                body: 'Something went wrong.',
            }
        }
    }
}