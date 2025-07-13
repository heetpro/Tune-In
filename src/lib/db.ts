import mongoose from "mongoose";
import { config } from "@/config/config";

// Accept the HTTP server instance
export function runServer(server: any) {
  mongoose
    .connect(config.db.url || "")
    .then(() => {
      // Use the HTTP server to listen
      server.listen(config.port, () => {
        console.log(`DB CONNECTED and server is running on port ${config.port}⚡️ - http://localhost:${config.port}`);
        console.log(`Socket.IO client script available at: http://localhost:${config.port}/socket.io/socket.io.js`);
      });
    })
    .catch(() => {
      console.error("Failed to connect to the database");
      process.exit(1);
    });
}