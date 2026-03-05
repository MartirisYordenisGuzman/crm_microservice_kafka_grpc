import { Router } from "express";
import { body } from "express-validator";
import { AuthController } from "../controllers/auth.controller";
import { validateRequest } from "../middleware/validate-request";

const router = Router();
const authController = new AuthController();

router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("firstName").trim().isLength({ min: 2, max: 50 }),
    body("lastName").trim().isLength({ min: 2, max: 50 }),
    body("password").isLength({ min: 8 }),
    body("roles").isArray({ min: 1 }),
    body("roles.*").isString(),
    validateRequest,
  ],
  authController.register.bind(authController),
);

router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty(), validateRequest],
  authController.login.bind(authController),
);

export { router as authRoutes };
