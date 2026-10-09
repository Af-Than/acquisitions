import express from "express";
import {
  getAllUsersHandler,
  getUserByIdHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
} from "#controllers/user.controller.js";
import { authenticate, authorize } from "#middleware/auth.middleware.js";

const routes = express.Router();

// Enforce authentication on all user endpoints
routes.use(authenticate);

// 1. GET /api/users -> List all users (Admin only)
routes.get("/", authorize("admin"), getAllUsersHandler);

// 2. GET /api/users/:id -> Get user by ID (Admin or Self)
routes.get("/:id", getUserByIdHandler);

// 3. POST /api/users -> Create user directly (Admin only)
routes.post("/", authorize("admin"), createUserHandler);

// 4. PUT /api/users/:id -> Update user details (Admin or Self)
routes.put("/:id", updateUserHandler);

// 5. DELETE /api/users/:id -> Delete user (Admin or Self)
routes.delete("/:id", deleteUserHandler);

export default routes;