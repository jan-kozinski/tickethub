import { ExpirationCompleteListener } from "../expirationCompletedListener";
import { natsWrapper } from "../../../NatsWrapper";
import { Ticket } from "../../../models/Ticket";
import { Order, OrderStatus } from "../../../models/Order";
import { ExpirationCompleteEvent } from "@dzony12-tickethub/common";
import { Message } from "node-nats-streaming";
import mongoose from "mongoose";

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = await Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  }).save();

  const order = await Order.build({
    userId: "doesn't matter",
    expiresAt: new Date(),
    status: OrderStatus.Created,
    ticket,
  }).save();

  const data: ExpirationCompleteEvent["data"] = { orderId: order.id };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, order, ticket, data, msg };
};

it("updates the order status to cancelled", async () => {
  const { listener, order, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});
it("emits an OrderCancelled event", async () => {
  const { listener, order, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const publishFn = natsWrapper.client.publish as jest.Mock;
  expect(publishFn).toHaveBeenCalledTimes(1);
  const publishedEventData = JSON.parse(publishFn.mock.calls[0][1]);
  expect(publishedEventData.id).toEqual(order.id);
});
it("acks the message", async () => {
  const { listener, order, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalledTimes(1);
});
