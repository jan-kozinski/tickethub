import request from "supertest";
import { app } from "../../app";
import { signin } from "../../test/signin";

it("returns a 404 if the ticket is not found", async () => {
  await request(app).get("/api/tickets/not-an-actual-id").send().expect(404);
});

it("returns a ticket if found", async () => {
  const title = "Snoop Dogg concert";
  const price = 420;

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", signin())
    .send({
      title,
      price,
    })
    .expect(201);

  const { id: ticketId } = response.body;

  const getTicketResponse = await request(app)
    .get(`/api/tickets/${ticketId}`)
    .send()
    .expect(200);

  expect(getTicketResponse.body.title).toEqual(title);
  expect(getTicketResponse.body.price).toEqual(price);
});
