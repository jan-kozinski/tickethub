import express from "express";
import { json } from "body-parser";
import "express-async-errors";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError } from "@dzony12-tickethub/common";
// ROUTE HANDLERS IMPORTS
import { currentUserRouter } from "./routes/currentUser";
import { signinRouter } from "./routes/signin";
import { signupRouter } from "./routes/signup";
import { signoutRouter } from "./routes/signout";

const app = express();

// CONFIG
const PORT = process.env.PORT || 3000;
app.set("trust proxy", true);
app.set("port", PORT);

// MIDDLEWARE
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: false,
  })
);

// ROUTES
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signupRouter);
app.use(signoutRouter);
// 404 ROUTE NOT FOUND
app.all("*", (req, res) => {
  throw new NotFoundError();
});
// ERROR CATCH MIDDLEWARE
app.use(errorHandler);

export { app };
