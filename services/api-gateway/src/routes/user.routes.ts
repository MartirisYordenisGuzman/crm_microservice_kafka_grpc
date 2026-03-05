import { Router } from "express";
import { body } from "express-validator";
import { UserController } from "../controllers/user.controller";
import { validateRequest } from "../middleware/validate-request";
import { authenticateToken, authorize } from "../middleware/auth";

const router = Router();

const userController = new UserController();

router.get("/:id", authenticateToken, userController.getUser.bind(userController));

router.get(
  "/user_by_email/:email",
  authenticateToken,
  userController.getUserByEmail.bind(userController),
);

router.put(
  "/:id",
  authenticateToken,
  [
    body("email").isEmail().normalizeEmail(),
    body("firstName").trim().isLength({ min: 2, max: 50 }),
    body("lastName").trim().isLength({ min: 2, max: 50 }),
    body("password").isLength({ min: 8 }),
    validateRequest,
  ],
  userController.updateUser.bind(userController),
);

router.delete("/:id", authenticateToken, userController.deleteUser.bind(userController));

export { router as userRoutes };
