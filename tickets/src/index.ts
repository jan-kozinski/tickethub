import mongoose from "mongoose";
import { app } from "./app";
import { natsWrapper } from "./NatsWrapper";
import { OrderCancelledListener } from "./events/listeners/orderCancelledListener";
import { OrderCreatedListener } from "./events/listeners/orderCreatedListener";

// Startup function
const start = async () => {
  console.log("starting up...");
  //CHECK IF NECCESSARY ENVIROMENTAL VARIABLES ARE PRESENT

  if (!process.env.JWT_SECRET) throw new Error("JWT_KEY variable is undefined");

  if (!process.env.MONGO_URI)
    throw new Error("MONGO_URI variable is undefined");

  if (!process.env.NATS_URL) throw new Error("NATS_URL variable is undefined");
  if (!process.env.NATS_CLUSTER_ID)
    throw new Error("NATS_CLUSTER_ID variable is undefined");
  if (!process.env.NATS_CLIENT_ID)
    throw new Error("NATS_CLIENT_ID variable is undefined");

  // CONNECT DATABASE AND NATS STREAMING SERVER
  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed! Terminating the process...");
      process.exit();
    });

    process.on("SIGINT", () => {
      natsWrapper.client.close();
    });
    process.on("SIGTERM", () => {
      natsWrapper.client.close();
    });

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error(error);
  }
  // LISTEN
  new OrderCancelledListener(natsWrapper.client).listen();
  new OrderCreatedListener(natsWrapper.client).listen();

  app.listen(app.get("port"), () => {
    console.log(`Service listening on port ${app.get("port")}`);
  });
};

// START SERVER
start();
