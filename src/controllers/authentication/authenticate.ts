import { HttpRequest, HttpResponse } from "../protocols.js";
import { AuthenticateUserParams, IAuthenticateUserController, IAuthenticateUserRepository } from "./protocols.js";
import { sign } from "hono/utils/jwt/jwt";

export class AuthenticateUserController implements IAuthenticateUserController {
    constructor(private readonly authenticateUserRepository: IAuthenticateUserRepository) { }

    async handle(httpRequest: HttpRequest<AuthenticateUserParams>): Promise<HttpResponse<string>> {
        try {
            if (!httpRequest.body) {
                return {
                    statusCode: 400,
                    body: 'Please specify a body',
                }
            }
            const user = await this.authenticateUserRepository.findUser(httpRequest.body);
            const payload = {
                userId: user.id,
                user: user.username,
                exp: Math.floor(Date.now() / 1000) + 60 * (Number(process.env.TOKEN_MINUTES))
            }
            const jwt = await sign(payload, String(process.env.JWT_SECRET))
            return { statusCode: 200, body: jwt};
        } catch (error) {
            return {
                statusCode: 500,
                body: String(error),
            }
        }
    }
}