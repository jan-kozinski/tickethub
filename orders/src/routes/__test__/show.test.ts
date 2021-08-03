import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/Ticket";
import { signin } from "../../test/signin";

it("fetches the order", async () => {
  // Create a ticket

  const ticket = Ticket.build({
    title: "Berlin Brothel entry ticket",
    price: 12000,
  });
  await ticket.save();

  const { body: orderInDb } = await request(app)
    .post("/api/orders")
    .set("Cookie", signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${orderInDb.id}`)
    .set("Cookie", signin())
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(orderInDb.id);
});

it("returns an error if one user tries to fetch another users order", async () => {
  // Create a ticket

  const ticket = Ticket.build({
    title: "Berlin Brothel entry ticket",
    price: 12000,
  });
  await ticket.save();

  const { body: orderInDb } = await request(app)
    .post("/api/orders")
    .set(
      "Cookie",
      signin({
        specifyUser: {
          id: "userA",
          email: "userA@test.com",
        },
      })
    )
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  await request(app)
    .get(`/api/orders/${orderInDb.id}`)
    .set(
      "Cookie",
      signin({
        specifyUser: {
          id: "userB",
          email: "userB@test.com",
        },
      })
    )
    .send()
    .expect(401);
});
