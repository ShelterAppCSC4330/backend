import { serve } from "@hono/node-server";
import app from "./app.js";
import { config } from "dotenv";
import { CreateUserController } from "./controllers/createUsers/createUsers.js";
import { GetUsersController } from "./controllers/getUsers/getUsers.js";
import { MongoClient } from "./database/mongo.js";
import { MongoGetUsersRepository } from "./repositories/getUsers/mongoGetUsers.js";
import { MongoCreateUserRepository } from "./repositories/createUsers/mongoCreateUsers.js";
import { userPassValidator } from "./helpers/validator.js";
import { MongoAuthenticateUserRepository } from "./repositories/authentication/mongoAuthenticate.js";
import { AuthenticateUserController } from "./controllers/authentication/authenticate.js";
import { MongoUpdateUserRepository } from "./repositories/updateUsers/mongoUpdateUsers.js";
import { UpdateUserController } from "./controllers/updateUsers/updateUsers.js";
import { MongoDeleteUserRepository } from "./repositories/deleteUsers/mongoDeleteUsers.js";
import { DeleteUserController } from "./controllers/deleteUsers/deleteUsers.js";

const main = async () => {
    config();
    await MongoClient.connect();

    app.get("/users", async (c) => {
        const mongoGetUsersRepository = new MongoGetUsersRepository();
        const getUsersController = new GetUsersController(mongoGetUsersRepository);
        const response = await getUsersController.handle();
        
        return c.json(response);
    });


    app.post('/users',
        userPassValidator,
        async (c) => {
            const mongoCreateUserRespository = new MongoCreateUserRepository();
            const createUserController = new CreateUserController(mongoCreateUserRespository);
            const reqBody = await c.req.json();
            const response = await createUserController.handle({
                body: reqBody,
            });

            return c.json(response);
        }
    );

    app.post('/authenticate',
        userPassValidator,
        async (c) => {
            const mongoAuthenticateUserRespository = new MongoAuthenticateUserRepository();
            const authenticateUserController = new AuthenticateUserController(mongoAuthenticateUserRespository);
            const reqBody = await c.req.json();
            const response = await authenticateUserController.handle({
                body: reqBody,
            });
            
            return c.json(response);
        }
    );

    app.patch('/users/:id', async (c) => {
        const mongoUpdateUserRepository = new MongoUpdateUserRepository();
        const updateUserController = new UpdateUserController(mongoUpdateUserRepository);
        const id = c.req.param('id');
        const reqBody = await c.req.json();
        const response = await updateUserController.handle({
            body: reqBody,
            params: { id }
        });

        return c.json(response.body);
    });
    
    app.delete('/users/:id', async (c) => {
        const mongoDeleteUserRepository = new MongoDeleteUserRepository();
        const deleteUserController = new DeleteUserController(mongoDeleteUserRepository);
        const id = c.req.param('id');
        const response = await deleteUserController.handle({
            params: { id }
        });
        
        return c.json(response.body);
    });
    
    const port = parseInt(process.env.PORT || '3000');
    serve({
        fetch: app.fetch,
        port,
    }, (info) => {
        console.log(`Server running on http://localhost:${info.port}`);
    });
}

main();