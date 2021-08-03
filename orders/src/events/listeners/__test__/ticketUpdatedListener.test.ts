import { Ticket } from "../../../models/Ticket";
import { natsWrapper } from "../../../NatsWrapper";
import { TicketUpdatedListener } from "../ticketUpdatedListener";
import mongoose from "mongoose";
import { TicketUpdatedEvent } from "@dzony12-tickethub/common";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client);

  const ticket = await Ticket.build({
    title: "concert",
    price: 20,
  }).save();

  const data: TicketUpdatedEvent["data"] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: "updated concert name",
    price: 999,
    ownerId: "doesn't matter",
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, data, ticket, listener };
};

it("finds, updates, and saves a ticket", async () => {
  const { msg, data, ticket, listener } = await setup();
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it("acks the message", async () => {
  const { msg, data, ticket, listener } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalledTimes(1);
});

it("doesn't ack the out of order events", async () => {
  const { msg, data, ticket, listener } = await setup();
  data.version = 999;
  await expect(listener.onMessage(data, msg)).rejects.toThrow();
  expect(msg.ack).not.toHaveBeenCalled();
});
