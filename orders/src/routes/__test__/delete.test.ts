import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/Ticket";
import { Order, OrderStatus } from "../../models/Order";
import { signin } from "../../test/signin";
import { natsWrapper } from "../../NatsWrapper";

it("marks an order as cancelled", async () => {
  const ticket = await Ticket.build({ title: "A ticket", price: 12 }).save();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", signin())
    .send()
    .expect(204);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emits an order cancelled event", async () => {
  const ticket = Ticket.build({
    title: "Talon for a circus show",
    price: 69,
  });
  await ticket.save();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toBeCalledTimes(1);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", signin())
    .send()
    .expect(204);
  expect(natsWrapper.client.publish).toBeCalledTimes(2);
});
