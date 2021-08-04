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
import { indexOrderRouter } from "./routes/index";
import { newOrderRouter } from "./routes/new";
import { showOrderRouter } from "./routes/show";
import { deleteOrderRouter } from "./routes/delete";

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
app.use(currentUser);

// ROUTES
app.use(indexOrderRouter);
app.use(newOrderRouter);
app.use(showOrderRouter);
app.use(deleteOrderRouter);

// 404 ROUTE NOT FOUND
app.all("*", (req, res) => {
  throw new NotFoundError();
});
// ERROR CATCH MIDDLEWARE
app.use(errorHandler);

export { app };
