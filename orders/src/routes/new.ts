import mongoose from "mongoose";
import express, { Request, Response } from "express";
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  BadRequestError,
} from "@dzony12-tickethub/common";
import { body } from "express-validator";
import { Ticket } from "../models/Ticket";
import { OrderStatus, Order } from "../models/Order";
import { OrderCreatedPublisher } from "../events/publishers/orderCreatedPublisher";
import { natsWrapper } from "../NatsWrapper";

const router = express.Router();

const FIFTEEN_MINUTES_IN_SECONDS = 900;
const EXPIRATION_WINDOW_SECONDS = FIFTEEN_MINUTES_IN_SECONDS;

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("TicketId must be provided and valid"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new NotFoundError();

    const ticketIsAlreadyReserved = await ticket.isReserved();

    if (ticketIsAlreadyReserved)
      throw new BadRequestError("Ticket is already reserved");

    const orderExpirationTime = new Date();
    orderExpirationTime.setSeconds(
      orderExpirationTime.getSeconds() + EXPIRATION_WINDOW_SECONDS
    );

    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: orderExpirationTime,
      ticket,
    });
    await order.save();

    // Publish an event saying that an order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
