import express from "express";
import { json } from "body-parser";
import "express-async-errors";
import cookieSession from "cookie-session";
import {
  errorHandler,
  NotFoundError,
  currentUser,
} from "@dzony12-tickethub/common";
// ROUTE HANDLERS IMPORTS
import { createChargeRouter } from "./routes/new";

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
    secure: process.env.NODE_ENV !== "test",
  })
);
app.use(currentUser);

// ROUTES
app.use(createChargeRouter);
// 404 ROUTE NOT FOUND
app.all("*", (req, res) => {
  throw new NotFoundError();
});
// ERROR CATCH MIDDLEWARE
app.use(errorHandler);

export { app };
