import * as userService from "#services/user.service.js";
import { createUserSchema, updateUserSchema, userIdParamSchema } from "#vali/user.validation.js";
import { formatValidationErrors } from "#utils/format.js";
import logger from "#config/logger..js";

/**
 * GET /api/users - Retrieve all users (Admin only)
 */
export const getAllUsersHandler = async (req, res, next) => {
  try {
    const data = await userService.getAllUsers();
    return res.status(200).json({
      message: "Users retrieved successfully",
      count: data.length,
      data,
    });
  } catch (err) {
    logger.error("Error retrieving users:", err);
    next(err);
  }
};

/**
 * GET /api/users/:id - Retrieve single user by ID
 * Allowed: Admin OR the user retrieving their own profile
 */
export const getUserByIdHandler = async (req, res, next) => {
  try {
    const paramValidation = userIdParamSchema.safeParse(req);
    if (!paramValidation.success) {
      return res.status(400).json({ errors: formatValidationErrors(paramValidation.error) });
    }

    const requestedId = paramValidation.data.params.id;

    // Authorization: User can only see their own profile unless admin
    if (req.user.role !== 'admin' && req.user.id !== requestedId) {
      return res.status(403).json({ message: "Forbidden: You can only view your own profile" });
    }

    const user = await userService.getUserById(requestedId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User retrieved successfully",
      data: user,
    });
  } catch (err) {
    logger.error("Error retrieving user by ID:", err);
    next(err);
  }
};

/**
 * POST /api/users - Create a new user (Admin only)
 */
export const createUserHandler = async (req, res, next) => {
  try {
    const validation = createUserSchema.safeParse(req);
    if (!validation.success) {
      return res.status(400).json({ errors: formatValidationErrors(validation.error) });
    }

    const newUser = await userService.createUser(validation.data.body);
    return res.status(201).json({
      message: "User created successfully",
      data: newUser,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    logger.error("Error creating user:", err);
    next(err);
  }
};

/**
 * PUT /api/users/:id - Update an existing user
 * Allowed: Admin (can update anyone & roles) OR Self (can update own details, but cannot change role)
 */
export const updateUserHandler = async (req, res, next) => {
  try {
    const validation = updateUserSchema.safeParse(req);
    if (!validation.success) {
      return res.status(400).json({ errors: formatValidationErrors(validation.error) });
    }

    const targetId = validation.data.params.id;
    const updateBody = { ...validation.data.body };

    // Authorization: User can only update their own profile unless admin
    if (req.user.role !== 'admin' && req.user.id !== targetId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
    }

    // Role escalation prevention: Non-admins cannot alter their role
    if (req.user.role !== 'admin' && updateBody.role) {
      return res.status(403).json({ message: "Forbidden: Only administrators can change roles" });
    }

    const updatedUser = await userService.updateUser(targetId, updateBody);
    return res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    logger.error("Error updating user:", err);
    next(err);
  }
};

/**
 * DELETE /api/users/:id - Delete a user
 * Allowed: Admin OR Self (deleting own account)
 */
export const deleteUserHandler = async (req, res, next) => {
  try {
    const paramValidation = userIdParamSchema.safeParse(req);
    if (!paramValidation.success) {
      return res.status(400).json({ errors: formatValidationErrors(paramValidation.error) });
    }

    const targetId = paramValidation.data.params.id;

    // Authorization: User can only delete their own profile unless admin
    if (req.user.role !== 'admin' && req.user.id !== targetId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own account" });
    }

    const deleted = await userService.deleteUser(targetId);
    return res.status(200).json({
      message: "User deleted successfully",
      deletedUserId: deleted.id,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    logger.error("Error deleting user:", err);
    next(err);
  }
};
