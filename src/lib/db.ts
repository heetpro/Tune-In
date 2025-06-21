import mongoose from "mongoose";
import { config } from "@/config/config";

export function runServer(app: any) {
  mongoose
    .connect(config.db.url || "")
    .then(() => {
      app.listen(config.port, () => {
        console.log(`DB CONNECTED ⚡️ - http://localhost:${config.port}`);
      });
    })
    .catch(() => {
      console.error("Failed to connect to the database");
      process.exit(1);
    });
}