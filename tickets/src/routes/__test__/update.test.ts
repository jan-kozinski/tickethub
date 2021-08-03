import request from "supertest";
import { app } from "../../app";
import { signin } from "../../test/signin";
import { natsWrapper } from "../../NatsWrapper";
import { Ticket } from "../../models/Ticket";
import mongoose from "mongoose";

const createAndSaveOneTicket = async (options?: any) => {
  return request(app).post("/api/tickets").set("Cookie", signin(options)).send({
    title: "a title",
    price: 20,
  });
};

it("returns a 404 if provided id doesn't exists", async () => {
  await request(app)
    .put("/api/tickets/not-an-actual-id")
    .set("Cookie", signin())
    .send({
      title: "a title of kind",
      price: 4,
    })
    .expect(404);
});

it("returns a 401 if user is not authenticated", async () => {
  await request(app)
    .put("/api/tickets/anything")
    .send({
      title: "a title of kind",
      price: 4,
    })
    .expect(401);
});

it("returns a 401 if user is not the ticket owner", async () => {
  const response = await createAndSaveOneTicket({
    specifyUser: {
      id: "not-the-author",
      email: "someguy@test.com",
    },
  });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", signin())
    .send({
      title: "new title",
      price: 1000,
    })
    .expect(401);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  const {
    body: { id },
  } = await createAndSaveOneTicket();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", signin())
    .send({
      title: "",
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", signin())
    .send({
      title: "git title",
      price: -20,
    })
    .expect(400);
});

it("updates the ticket if given the valid input", async () => {
  const {
    body: { id },
  } = await createAndSaveOneTicket();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", signin())
    .send({
      title: "git title",
      price: 21,
    })
    .expect(200);

  const { body: updatedTicket } = await request(app)
    .get(`/api/tickets/${id}`)
    .send();
  expect(updatedTicket.title).toEqual("git title");
  expect(updatedTicket.price).toEqual(21);
});

it("publishes an event", async () => {
  const {
    body: { id },
  } = await createAndSaveOneTicket();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", signin())
    .send({
      title: "git title",
      price: 21,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toBeCalledTimes(2);
});

it("rejects to update a reserved ticket", async () => {
  const {
    body: { id },
  } = await createAndSaveOneTicket();
  const ticket = await Ticket.findById(id);
  await ticket!.set("associatedOrderId", mongoose.Types.ObjectId).save();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", signin())
    .send({
      title: "git title",
      price: 21,
    })
    .expect(400);
});
