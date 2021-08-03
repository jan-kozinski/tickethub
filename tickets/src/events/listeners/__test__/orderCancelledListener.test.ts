import { Ticket } from "../../../models/Ticket";
import { natsWrapper } from "../../../NatsWrapper";
import { OrderCancelledListener } from "../orderCancelledListener";
import { OrderCancelledEvent } from "@dzony12-tickethub/common";
import { Message } from "node-nats-streaming";
import mongoose from "mongoose";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const ticket = await Ticket.build({
    title: "concert",
    price: 15,
    ownerId: mongoose.Types.ObjectId().toHexString(),
  })
    .set({ associatedOrderId: mongoose.Types.ObjectId().toHexString() })
    .save();

  const data: OrderCancelledEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, ticket, data, msg };
};

it("clears the associatedOrderId of the ticket", async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.associatedOrderId).toBeUndefined();
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
