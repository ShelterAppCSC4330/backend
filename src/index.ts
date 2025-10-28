import { serve } from "@hono/node-server";
import app from "./app.js";
import { config } from "dotenv";
import { CreateUserController } from "./controllers/createUsers/createUsers.js";
import { GetUsersController } from "./controllers/getUsers/getUsers.js";
import { MongoClient } from "./database/mongo.js";
import { MongoGetUsersRepository } from "./repositories/getUsers/mongoGetUsers.js";
import { MongoCreateUserRepository } from "./repositories/createUsers/mongoCreateUsers.js";
import { userPassValidator } from "./helpers/validator.js";

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
    
    const port = parseInt(process.env.PORT || '3000');
    serve({
        fetch: app.fetch,
        port,
    }, (info) => {
        console.log(`Server running on http://localhost:${info.port}`);
    });
}

main();