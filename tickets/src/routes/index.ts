import express, { Request, Response } from "express";
import { Ticket } from "../models/Ticket";

const router = express.Router();

router.get("/api/tickets", async (req: Request, res: Response) => {
  const tickets = await Ticket.find({ associatedOrderId: undefined });
  return res.status(200).send(tickets);
});

export { router as indexTicketRouter };
