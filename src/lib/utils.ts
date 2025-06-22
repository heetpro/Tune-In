import { config } from "@/config/config";

export const cors = {
  origin: config.cors.origin,
  credentials: true,
};
