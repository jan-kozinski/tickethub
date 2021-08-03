import {
  forbiddenError,
  NotFoundError,
  OrderStatus,
  requireAuth,
} from "@dzony12-tickethub/common";
import express, { Request, Response } from "express";
import { Order } from "../models/Order";
import { OrderCancelledPublisher } from "../events/publishers/orderCancelledPublisher";
import { natsWrapper } from "../NatsWrapper";

const router = express.Router();

router.delete(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("ticket");
    if (!order) throw new NotFoundError();

    if (order.userId !== req.currentUser!.id) throw new forbiddenError();

    order.set({ status: OrderStatus.Cancelled });

    await order.save();

    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
