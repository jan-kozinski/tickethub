import { Ticket } from "../../../models/Ticket";
import { natsWrapper } from "../../../NatsWrapper";
import { OrderCreatedListener } from "../orderCreatedListener";
import { OrderCreatedEvent } from "@dzony12-tickethub/common";
import { Message } from "node-nats-streaming";
import mongoose from "mongoose";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const ticket = await Ticket.build({
    title: "cocnert",
    price: 15,
    ownerId: "doesn't matter",
  }).save();

  const data: OrderCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: "doesn't matter",
    expiresAt: "doesn't matter",
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, ticket, data, msg };
};

it("sets the associatedOrderId of the ticket", async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.associatedOrderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalledTimes(1);
});

it("publishes a ticket updated event", async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
  // @ts-ignore
  const publishArgs = natsWrapper.client.publish.mock.calls[0];
  const publishedEventData = JSON.parse(publishArgs[1]);
  expect(publishArgs[0]).toEqual("ticket:updated");
  expect(publishedEventData.version).toEqual(ticket.version + 1);
  expect(publishedEventData.id).toEqual(ticket.id);
});
