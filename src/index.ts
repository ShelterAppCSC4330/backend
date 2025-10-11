import { serve } from "@hono/node-server";
import app from "./app.js";
import { GetUsersController } from "./controllers/GetUsers/getUsers.js";
import { MongoGetUsersRepository } from "./repositories/getUsers/mongoGetUsers.js";

app.get("/users", async (c) => {
    const mongoGetUsersRepository = new MongoGetUsersRepository();
    const getUsersController = new GetUsersController(mongoGetUsersRepository);
    const response = await getUsersController.handle();
    
    return c.json(response);
});

const port = parseInt(process.env.PORT || '3000');

serve({
    fetch: app.fetch,
    port,
}, (info) => {
    console.log(`Server running on http://localhost:${info.port}`);
});