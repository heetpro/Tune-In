import mongoose from "mongoose";
import { config } from "@/config/config";

// Change to accept the http server instead of the Express app
export function runServer(server: any) {
  mongoose
    .connect(config.db.url || "")
    .then(() => {
      // Use the provided server to listen
      server.listen(config.port, () => {
        console.log(`DB CONNECTED ⚡️ - http://localhost:${config.port}`);
      });
    })
    .catch(() => {
      console.error("Failed to connect to the database");
      process.exit(1);
    });
}