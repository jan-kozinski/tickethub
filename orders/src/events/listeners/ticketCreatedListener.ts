import {
  Listener,
  TicketCreatedEvent,
  Subjects,
} from "@dzony12-tickethub/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/Ticket";
import { queueGroupName } from "./queueGroupName";
export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    const { title, price, id } = data;
    const ticket = Ticket.build({ title, price, id });
    await ticket.save();
    msg.ack();
  }
}
