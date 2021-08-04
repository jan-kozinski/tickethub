import { natsWrapper } from "./NatsWrapper";
import { OrderCreatedListener } from "./events/listeners/orderCreatedListener";

// Startup function
const start = async () => {
  console.log("starting up...");
  //CHECK IF NECCESSARY ENVIROMENTAL VARIABLES ARE PRESENT

  const envVariables = [
    "NATS_URL",
    "NATS_CLUSTER_ID",
    "NATS_CLIENT_ID",
    "REDIS_HOST",
  ];
  const checkForVariables = (vars: string[]): void => {
    vars.forEach((v) => {
      if (!process.env[v]) throw new Error(`${v} is not defined`);
    });
  };
  checkForVariables(envVariables);

  // CONNECT TO NATS STREAMING SERVER
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
  } catch (error) {
    console.error(error);
  }
  // LISTEN
  new OrderCreatedListener(natsWrapper.client).listen();
};

// START SERVER
start();
