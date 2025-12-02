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
import { GoogleGenerativeAI } from "@google/generative-ai";

const main = async () => {
    config();
    await MongoClient.connect();

    // Google Gemini client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const SYSTEM_PROMPT = `You are a helpful AI assistant for the Refuge app, which helps people find emergency shelters and stay prepared for disasters.

Your primary responsibilities:
1. Help users find nearby shelters (homeless shelters, disaster relief centers, domestic violence shelters, etc.)
2. Provide information about shelter services, requirements, and availability
3. Offer guidance on emergency preparedness
4. Answer questions about weather alerts and safety procedures
5. Provide emotional support and resources for people in crisis

Guidelines:
- Be compassionate and understanding - many users may be in difficult situations
- Provide clear, actionable information
- If someone is in immediate danger, advise them to call 911
- For mental health crises, mention the 988 Suicide & Crisis Lifeline
- Keep responses concise but helpful`;

    // Chatbot route
    app.post("/api/chat", async (c) => {
        try {
            const { question } = await c.req.json();

            if (!question) {
                return c.json({ error: "Question is required" }, 400);
            }

            const chat = model.startChat({
                history: [
                    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
                    { role: "model", parts: [{ text: "Understood. I'm ready to help users with shelter information and emergency preparedness." }] },
                ],
            });

            const result = await chat.sendMessage(question);
            const response = result.response.text();

            return c.json({ response });
        } catch (error) {
            console.error("Chatbot error:", error);
            return c.json({ error: "Failed to get response" }, 500);
        }
    });

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
    
    const port = parseInt(process.env.PORT || '3000');
    serve({
        fetch: app.fetch,
        port,
    }, (info) => {
        console.log(`Server running on http://localhost:${info.port}`);
    });
}

main();