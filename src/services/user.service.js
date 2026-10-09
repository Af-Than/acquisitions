import { db } from "#config/database.js";
import { users } from "#models/user.model.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import logger from "#config/logger..js";

const SAFE_USER_COLUMNS = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

/**
 * Retrieve all users (excluding passwords)
 */
export const getAllUsers = async () => {
  return await db.select(SAFE_USER_COLUMNS).from(users);
};

/**
 * Retrieve a user by ID (excluding passwords)
 */
export const getUserById = async (id) => {
  const [user] = await db
    .select(SAFE_USER_COLUMNS)
    .from(users)
    .where(eq(users.id, Number(id)))
    .limit(1);

  return user || null;
};

/**
 * Create a new user (with password hashing)
 */
export const createUser = async ({ name, email, password, role = 'user' }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if email already in use
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existing.length > 0) {
    const error = new Error('User with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const [newUser] = await db
    .insert(users)
    .values({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
    })
    .returning(SAFE_USER_COLUMNS);

  logger.info(`User created successfully: ID=${newUser.id}, Email=${newUser.email}, Role=${newUser.role}`);
  return newUser;
};

/**
 * Update an existing user by ID
 */
export const updateUser = async (id, updateData) => {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.id, Number(id)))
    .limit(1);

  if (existing.length === 0) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const fieldsToUpdate = {
    updatedAt: new Date(),
  };

  if (updateData.name) {
    fieldsToUpdate.name = updateData.name;
  }

  if (updateData.email) {
    const normalizedEmail = updateData.email.toLowerCase().trim();
    if (normalizedEmail !== existing[0].email) {
      const emailConflict = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);

      if (emailConflict.length > 0) {
        const error = new Error('Email is already in use by another account');
        error.statusCode = 409;
        throw error;
      }
      fieldsToUpdate.email = normalizedEmail;
    }
  }

  if (updateData.password) {
    fieldsToUpdate.password = await bcrypt.hash(updateData.password, 12);
  }

  if (updateData.role) {
    fieldsToUpdate.role = updateData.role;
  }

  const [updatedUser] = await db
    .update(users)
    .set(fieldsToUpdate)
    .where(eq(users.id, Number(id)))
    .returning(SAFE_USER_COLUMNS);

  logger.info(`User updated: ID=${updatedUser.id}`);
  return updatedUser;
};

/**
 * Delete a user by ID
 */
export const deleteUser = async (id) => {
  const [deletedUser] = await db
    .delete(users)
    .where(eq(users.id, Number(id)))
    .returning({ id: users.id, email: users.email });

  if (!deletedUser) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  logger.info(`User deleted: ID=${deletedUser.id}, Email=${deletedUser.email}`);
  return deletedUser;
};
