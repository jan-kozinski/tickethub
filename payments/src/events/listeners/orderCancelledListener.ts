import {
  Listener,
  OrderCancelledEvent,
  OrderStatus,
  Subjects,
} from "@dzony12-tickethub/common";
import { queueGroupName } from "./queueGroupName";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/Order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });
    if (!order)
      throw new Error(
        "orderCancelledListener: Order.findOne order is undefined"
      );
    await order.set("status", OrderStatus.Cancelled).save();
    msg.ack();
  }
}
