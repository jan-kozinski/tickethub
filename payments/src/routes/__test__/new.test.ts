import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { OrderStatus } from "@dzony12-tickethub/common";
import { Order } from "../../models/Order";
import { signin } from "../../test/signin";
import { stripe } from "../../stripe";

jest.mock("../../stripe");

it("returns a 404 when purchasing an order that does not exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", signin())
    .send({
      token: "random",
      orderId: mongoose.Types.ObjectId(),
    })
    .expect(404);
});

it("returns a 401 when purchasing an order that does not belong to the user", async () => {
  const order = await Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  }).save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", signin())
    .send({
      token: "random",
      orderId: order._id,
    })
    .expect(401);
});

it("returns a 400 when purchasing a cancelled order", async () => {
  const user = {
    id: mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };

  const order = await Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: user.id,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled,
  }).save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", signin({ specifyUser: user }))
    .send({
      token: "random",
      orderId: order._id,
    })
    .expect(400);
});

it("returns a 201 with valid iputs", async () => {
  const user = {
    id: mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };

  const order = await Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: user.id,
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  }).save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", signin({ specifyUser: user }))
    .send({
      token: "tok_visa",
      orderId: order._id,
    })
    .expect(201);
  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOptions.source).toEqual("tok_visa");
  expect(chargeOptions.amount).toEqual(order.price * 100); //times 100 to convert polish Złoty (1 PLN) to polish Grosz (0.01 PLN)
  expect(chargeOptions.currency).toEqual("pln");
});
