import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from "@dzony12-tickethub/common";
import { queueGroupName } from "./queueGroupName";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/Ticket";
import { TicketUpdatedPublisher } from "../publishers/ticketUpdatedPublisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) throw new Error("Ticket not found");

    await ticket.set({ associatedOrderId: data.id }).save();
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      ownerId: ticket.ownerId,
      title: ticket.title,
      price: ticket.price,
      associatedOrderId: ticket.associatedOrderId,
    });
    msg.ack();
  }
}
