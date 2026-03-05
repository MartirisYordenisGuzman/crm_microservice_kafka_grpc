import { Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validate-request";
import { authenticateToken, authorize } from "../middleware/auth";
import { OrderController } from "../controllers/order.controller";

const router = Router();
const orderController = new OrderController();

router.post(
  "/",
  authenticateToken,
  authorize(["Customer"]),
  [
    body("userId").trim().isLength({ min: 2, max: 100 }),
    body("items").isArray({ min: 1 }),
    body("items.*.productId").trim().isLength({ min: 2, max: 100 }),
    body("items.*.quantity").isInt({ gt: 0 }),
    body("items.*.price").isFloat({ gt: 0 }),
    validateRequest,
  ],
  orderController.createOrder.bind(orderController),
);

router.get(
  "/:id",
  authenticateToken,
  authorize(["Admin"]),
  orderController.getOrderById.bind(orderController),
);
router.get(
  "/user/:userId",
  authenticateToken,
  authorize(["Admin", "Customer"]),
  orderController.getOrdersByUserId.bind(orderController),
);

export { router as orderRoutes };
