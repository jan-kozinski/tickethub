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
import { createTicketRouter } from "./routes/new";
import { showTicketRouter } from "./routes/show";
import { indexTicketRouter } from "./routes";
import { updateTicketRouter } from "./routes/update";

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
app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);
// 404 ROUTE NOT FOUND
app.all("*", (req, res) => {
  throw new NotFoundError();
});
// ERROR CATCH MIDDLEWARE
app.use(errorHandler);

export { app };
