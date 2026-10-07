import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(1, { message: 'Name is required' }).trim(),
    email: z.email({ message: 'Invalid email address' }).trim(),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
    role: z.enum(['user', 'admin'], { message: 'Role must be either user or admin' }).default('user'),
  }),
});


export const signinSchema = z.object({
  body: z.object({
    email: z.email({ message: 'Invalid email address' }).trim(),
    password: z.string().min(1, { message: 'Password is required' }),
  }),
});