import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../database.js";
import crypto, { randomUUID } from "node:crypto";
import { request } from "node:http";

export function userRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    console.log(`[${request.method}] ${request.url}`);
  });

  app.post("/", async (request, reply) => {
    const createUsersBodySchema = z.object({
      name: z.string(),
    });

    const { name } = createUsersBodySchema.parse(request.body);

    await db("user").insert({
      id: crypto.randomUUID(),
      name,
    });

    return reply.status(201).send();
  });
}
