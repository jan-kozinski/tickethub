import request from "supertest";
import { app } from "../../app";
import { signin } from "../../test/signin";

const createAndSaveOneTicket = async () => {
  return request(app).post("/api/tickets").set("Cookie", signin()).send({
    title: "a title",
    price: 20,
  });
};

it("should fetch a list of all tickets", async () => {
  await createAndSaveOneTicket();
  await createAndSaveOneTicket();
  await createAndSaveOneTicket();
  await createAndSaveOneTicket();

  const response = await request(app).get("/api/tickets").send().expect(200);

  expect(response.body.length).toEqual(4);
});
