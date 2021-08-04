import mongoose from "mongoose";
import { app } from "./app";
import { ExpirationCompleteListener } from "./events/listeners/expirationCompletedListener";
import { TicketCreatedListener } from "./events/listeners/ticketCreatedListener";
import { TicketUpdatedListener } from "./events/listeners/ticketUpdatedListener";
import { PaymentCreatedListener } from "./events/listeners/paymentCreatedListener";
import { natsWrapper } from "./NatsWrapper";

// Startup function
const start = async () => {
  console.log("Starting up....");
  //CHECK IF NECCESSARY ENVIROMENTAL VARIABLES ARE PRESENT
  const envVariables = [
    "JWT_SECRET",
    "MONGO_URI",
    "NATS_URL",
    "NATS_CLUSTER_ID",
    "NATS_CLIENT_ID",
  ];
  const checkForVariables = (vars: string[]): void => {
    vars.forEach((v) => {
      if (!process.env[v]) throw new Error(`${v} is not defined`);
    });
  };
  checkForVariables(envVariables);

  // CONNECT DATABASE AND NATS STREAMING SERVER
  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID!,
      process.env.NATS_CLIENT_ID!,
      process.env.NATS_URL!
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

    await mongoose.connect(process.env.MONGO_URI!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error(error);
  }
  // LISTEN
  new TicketCreatedListener(natsWrapper.client).listen();
  new TicketUpdatedListener(natsWrapper.client).listen();
  new ExpirationCompleteListener(natsWrapper.client).listen();
  new PaymentCreatedListener(natsWrapper.client).listen();

  app.listen(app.get("port"), () => {
    console.log(`Service listening on port ${app.get("port")}`);
  });
};

// START SERVER
start();
