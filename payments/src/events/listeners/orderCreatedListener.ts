import {
  Listener,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from "@dzony12-tickethub/common";
import { queueGroupName } from "./queueGroupName";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/Order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    await Order.build({
      id: data.id,
      price: data.ticket.price,
      userId: data.userId,
      version: data.version,
      status: OrderStatus.Created,
    }).save();
    msg.ack();
  }
}
