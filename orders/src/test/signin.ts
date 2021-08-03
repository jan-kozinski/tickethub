import jwt from "jsonwebtoken";

interface signinOptions {
  specifyUser?: {
    id: string;
    email: string;
  };
}

export const signin = (options?: signinOptions) => {
  // Build a JWT payload. { id, email }
  let payload;
  if (options?.specifyUser) payload = options.specifyUser;
  else
    payload = {
      id: "fake-id-dskjfsdj3",
      email: "test@test.com",
    };
  // Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_SECRET!);
  // Build session Object. { jwt: MY_JWT }
  const session = { jwt: token };
  // Turn session into JSON
  const sessionJSON = JSON.stringify(session);
  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");
  // return a string thats the cookie with encoded data
  return [`express:sess=${base64}`];
};
