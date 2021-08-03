import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  forbiddenError,
  CustomError,
  BadRequestError,
} from "@dzony12-tickethub/common";
import { Ticket } from "../models/Ticket";
import { TicketUpdatedPublisher } from "../events/publishers/ticketUpdatedPublisher";
import { natsWrapper } from "../NatsWrapper";

const router = express.Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({
        gt: 0,
      })
      .withMessage("Price must be greater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const ticket = await Ticket.findById(req.params.id);
      if (!ticket) throw new NotFoundError();
      if (ticket.ownerId !== req.currentUser!.id) throw new forbiddenError();
      if (ticket.associatedOrderId)
        throw new BadRequestError("Ticket is reserved");

      const {
        body: { title, price },
      } = req;

      ticket.set({
        title,
        price,
      });

      await ticket.save();
      new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        version: ticket.version,
        title: ticket.title,
        price: ticket.price,
        ownerId: ticket.ownerId,
      });

      return res.status(200).send(ticket);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new NotFoundError();
    }
  }
);

export { router as updateTicketRouter };
