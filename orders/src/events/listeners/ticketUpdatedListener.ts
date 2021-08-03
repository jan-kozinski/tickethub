import {
  Listener,
  TicketUpdatedEvent,
  Subjects,
} from "@dzony12-tickethub/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/Ticket";
import { queueGroupName } from "./queueGroupName";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;
  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    const { title, price, id, version } = data;
    const ticket = await Ticket.findByEvent({ id, version });
    if (!ticket) throw new Error("Ticket not found");
    ticket.set({ title, price });
    await ticket.save();
    msg.ack();
  }
}
