import mongoose from "mongoose";
import { app } from "./app";

// Startup function
const start = async () => {
  //CHECK IF NECESSARY ENVIROMENTAL VARIABLES ARE PRESENT
  if (!process.env.JWT_SECRET) throw new Error("JWT_KEY variable is undefined");
  if (!process.env.MONGO_URI)
    throw new Error("MONGO_URI variable is undefined");

  // CONNECT DATABASE
  try {
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
  app.listen(app.get("port"), () => {
    console.log(`Service listening on port ${app.get("port")}`);
  });
};

// START SERVER
start();
