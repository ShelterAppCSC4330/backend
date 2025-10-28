import { validator } from "hono/validator";

export const userPassValidator = validator("json", (value, context) => {
        const { username, password } = value;
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
    })