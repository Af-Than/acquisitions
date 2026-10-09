import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, { message: 'Name is required' }).trim(),
    email: z.string().email({ message: 'Invalid email address' }).trim(),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
    role: z.enum(['user', 'admin'], { message: 'Role must be either user or admin' }).default('user'),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive({ message: 'User ID must be a positive integer' }),
  }),
  body: z.object({
    name: z.string().min(1, { message: 'Name cannot be empty' }).trim().optional(),
    email: z.string().email({ message: 'Invalid email address' }).trim().optional(),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long' }).optional(),
    role: z.enum(['user', 'admin'], { message: 'Role must be either user or admin' }).optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  }),
});

export const userIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive({ message: 'User ID must be a positive integer' }),
  }),
});
