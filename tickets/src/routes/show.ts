import { CustomError, NotFoundError } from "@dzony12-tickethub/common";
import express, { Request, Response } from "express";
import { Ticket } from "../models/Ticket";

const router = express.Router();

router.get("/api/tickets/:id", async (req: Request, res: Response) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) throw new NotFoundError();
    return res.status(200).send(ticket);
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new NotFoundError();
  }
});

export { router as showTicketRouter };
