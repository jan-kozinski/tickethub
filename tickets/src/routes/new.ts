import express, { Request, Response } from "express";
import { requireAuth, validateRequest } from "@dzony12-tickethub/common";
import { body } from "express-validator";
import { Ticket } from "../models/Ticket";
import { TicketCreatedPublisher } from "../events/publishers/ticketCreatedPublisher";
import { natsWrapper } from "../NatsWrapper";

const router = express.Router();

router.post(
  "/api/tickets",
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
    const { title, price } = req.body;
    const ticket = Ticket.build({
      title,
      price,
      ownerId: req.currentUser!.id,
    });

    await ticket.save();
    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      version: ticket.version,
      ownerId: ticket.ownerId,
      title: ticket.title,
      price: ticket.price,
    });
    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
