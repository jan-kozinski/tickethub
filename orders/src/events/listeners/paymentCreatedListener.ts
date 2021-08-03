import {
  Subjects,
  Listener,
  PaymentCreatedEvent,
  OrderStatus,
} from "@dzony12-tickethub/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queueGroupName";
import { Order } from "../../models/Order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) throw new Error("Order not found");

    await order
      .set({
        status: OrderStatus.Complete,
      })
      .save();
    msg.ack();
  }
}
