import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../database.js";
import crypto, { randomUUID } from "node:crypto";
import { checkSessionIdExists } from "../middleware/check-session-id.js";

export function userRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    console.log(`[${request.method}] ${request.url}`);
  });

  app.post("/", async (request, reply) => {
    const createUsersBodySchema = z.object({
      name: z.string(),
    });

    const { name } = createUsersBodySchema.parse(request.body);

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    await db("user").insert({
      id: crypto.randomUUID(),
      session_id: sessionId,
      name,
    });

    return reply.status(201).send();
  });
}
