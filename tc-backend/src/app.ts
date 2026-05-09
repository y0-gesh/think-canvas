import { join } from "node:path";
import type { FastifyPluginAsync } from "fastify";
import autoload from "@fastify/autoload";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type AppOptions = {
  // Place your custom options for app below here.
};

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts,
): Promise<void> => {
  // CORS — allow frontend
  void fastify.register(cors, {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });

  // WebSocket
  void fastify.register(websocket);

  // This loads all plugins defined in plugins
  // those should be reusable plugins and ideally ones that are declared
  // with fastify-plugin
  void fastify.register(autoload, {
    dir: join(__dirname, "plugins"),
    options: opts,
  });

  // This loads all routes defined in routes
  // define your routes in one of these
  void fastify.register(autoload, {
    dir: join(__dirname, "routes"),
    options: opts,
  });
};

export default app;
export { app };
