import { Hono } from "hono"
import { validator } from "hono/validator";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import * as argon2 from "argon2";

dotenv.config();

const app = new Hono();
const client = new MongoClient(process.env.DATABASE_URL);
const database = client.db("app");
const users = database.collection("users");

users.createIndex({ username: 1 }, { unique: true });

app.post(
    "/users/register",
    validator("json", (value, context) => {
        const username = value["username"];
        const password = value["password"];
        if (!username
            || typeof username !== "string"
            || username.trim().length == 0
            || username.trim().length > 20) {
            return context.json({ message: "Username must be a non-empty string up to 20 characters." }, 400);
        }
        if (!password
            || typeof password !== "string"
            || password.length < 8) {
            return context.json({ message: "Password must be at least 8 characters long." }, 400);
        }
        return { username: username.trim().toLowerCase(), password: password };
    }),
    async (context) => {
        const body = context.req.valid("json");
        const username = body.username;
        const hashedPassword = await argon2.hash(body.password);
        const findExistingUserQuery = { username: username.trim().toLowerCase() };
        const findExistingUserResult = await users.findOne(findExistingUserQuery);
        if (findExistingUserResult != null) {
            return context.json({ message: "User already exists." }, 400);
        }
        try {
            await users.insertOne({ username: username, password: hashedPassword });
            return context.json({ message: "User successfully registered." }, 201);
        } catch (e) {
            return context.json({ message: "Unexpected error occured, try again later." }, 500);
        }
    }
);