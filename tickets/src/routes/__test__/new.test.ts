import request from "supertest";
import { app } from "../../app";
import { signin } from "../../test/signin";
import { Ticket } from "../../models/Ticket";
import { natsWrapper } from "../../NatsWrapper";

it("has a route handler listening to /api/tickets for post request", async () => {
  const response = await request(app).post("/api/tickets").send({});
  expect(response.status).not.toEqual(404);
});

it("can only be accesed if the user is signed in", async () => {
  await request(app).post("/api/tickets").send({}).expect(401);
});

it("returns status other than 401 if the user is signed in", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({});
  expect(response.status).not.toEqual(401);
});

it("returns an error if invalid title is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({
      title: "",
      price: 10,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({
      price: 10,
    })
    .expect(400);
});

it("returns an error if invalid price is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({
      title: "Valid ticket title",
      price: -10,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({
      title: "Valid ticket title",
    })
    .expect(400);
});

it("creates a ticket with valid inputs", async () => {
  // add in a check to make sure that ticket was saved
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);
  await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({
      title: "valid title",
      price: 20,
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(20);
  expect(tickets[0].title).toEqual("valid title");
});

it("publishes an event", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({
      title: "valid title",
      price: 20,
    })
    .expect(201);
  expect(natsWrapper.client.publish).toBeCalledTimes(1);
});
