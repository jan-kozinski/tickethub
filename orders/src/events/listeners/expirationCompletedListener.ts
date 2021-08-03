import {
  Listener,
  ExpirationCompleteEvent,
  Subjects,
} from "@dzony12-tickethub/common";
import { Message } from "node-nats-streaming";
import { Order, OrderStatus } from "../../models/Order";
import { OrderCancelledPublisher } from "../publishers/orderCancelledPublisher";
import { queueGroupName } from "./queueGroupName";
export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;
  async onMessage(data: ExpirationCompleteEvent["data"], msg: Message) {
    const { orderId } = data;
    const order = await Order.findById(orderId).populate("ticket");
    if (!order) throw new Error("Order not found");
    if (order.status === OrderStatus.Complete) return msg.ack();
    order.set({ status: OrderStatus.Cancelled });

    await order.save();

    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });
    msg.ack();
  }
}
