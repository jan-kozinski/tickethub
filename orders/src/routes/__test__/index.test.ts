import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/Order";
import { Ticket, TicketDoc } from "../../models/Ticket";
import { signin } from "../../test/signin";

const buildAndSaveOneTicket = async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
  });
  await ticket.save();
  return ticket;
};

const createAnOrder = async (author: string[], ticket: TicketDoc) => {
  const res = await request(app)
    .post("/api/orders")
    .set("Cookie", author)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);
  return res;
};

it("fetches orders for a particular user", async () => {
  const ticketOne = await buildAndSaveOneTicket();
  const ticketTwo = await buildAndSaveOneTicket();
  const ticketThree = await buildAndSaveOneTicket();

  const userA = signin({
    specifyUser: {
      id: "userA",
      email: "userA@test.com",
    },
  });

  const { body: orderOne } = await createAnOrder(userA, ticketOne);

  const userB = signin({
    specifyUser: {
      id: "userB",
      email: "userB@test.com",
    },
  });

  const { body: orderTwo } = await createAnOrder(userB, ticketTwo);
  const { body: orderThree } = await createAnOrder(userB, ticketThree);

  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", userB)
    .expect(200);

  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderTwo.id);
  expect(response.body[1].id).toEqual(orderThree.id);
  expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
  expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});
