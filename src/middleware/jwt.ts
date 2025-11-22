import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';

export interface AuthVariables {
  user: {
    username: string;
  };
}

export const jwtMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Missing or invalid authorization header' }, 401);
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return c.json({ error: 'Token missing' }, 401);
    }

    const payload = await verify(token, process.env.JWT_SECRET!);
    
    c.set('user', payload);
    
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
};