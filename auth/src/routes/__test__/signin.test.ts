import request from "supertest";
import { app } from "../../app";

it("fails whe na email that does not exists is supplied", async () => {
  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      passowrd: "password",
    })
    .expect(400);
});
it("fails when an incorrect password is supplied", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      passowrd: "incorrect",
    })
    .expect(400);
});

it("succeeds when an legit credentials are supplied", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  const response = await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(200);
  expect(response.get("Set-Cookie")).toBeDefined();
});
