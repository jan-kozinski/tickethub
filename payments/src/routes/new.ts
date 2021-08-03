import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  forbiddenError,
  OrderStatus,
} from "@dzony12-tickethub/common";
import { stripe } from "../stripe";
import { Order } from "../models/Order";
import { Payment } from "../models/Payment";
import { PaymentCreatedPublisher } from "../events/publishers/paymentCreatedPublisher";
import { natsWrapper } from "../NatsWrapper";

const router = express.Router();

router.post(
  "/api/payments",
  requireAuth,
  [body("token").not().isEmpty(), body("orderId").not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError();
    if (order.userId !== req.currentUser!.id) throw new forbiddenError();
    if (order.status === OrderStatus.Cancelled)
      throw new BadRequestError("Caanot pay for an cancelled order");

    const charge = await stripe.charges.create({
      currency: "pln",
      amount: order.price * 100,
      source: token,
    });

    const payment = await Payment.build({
      orderId,
      stripeId: charge.id,
    }).save();

    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId,
    });

    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
