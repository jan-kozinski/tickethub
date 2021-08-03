import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from "@dzony12-tickethub/common";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expirationQueue";
import { queueGroupName } from "./queueGroupName";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const expirationTime = new Date(data.expiresAt).getTime();
    const currentTime = new Date().getTime();
    const delay = expirationTime - currentTime;
    console.log("waiting for: ", delay);
    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay,
      }
    );
    msg.ack();
  }
}
