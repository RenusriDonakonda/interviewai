const mongoose = require("mongoose");

const connectDb = async () => {
  const uri = process.env.MONGODB_URI || "";
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  mongoose.connection.on("connected", () => {
    console.log("Database connected");
  });
  mongoose.connection.on("error", (err) => {
    console.error("Database connection error", err.message);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("Database disconnected");
  });

  await mongoose.connect(uri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    family: 4
  });
  return mongoose.connection;
};

module.exports = connectDb;
