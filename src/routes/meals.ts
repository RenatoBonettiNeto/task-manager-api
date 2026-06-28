import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../database.js";
import crypto, { randomUUID } from "node:crypto";
import { checkSessionIdExists } from "../middleware/check-session-id.js";

export function mealRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    console.log(`[${request.method}] ${request.url}`);
  });

  app.post(
    "/",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const createMealsBodySchema = z.object({
        name: z.string(),
        describe: z.string(),
        date: z.coerce.date(),
        is_on_diet: z.boolean(),
      });

      const { name, describe, date, is_on_diet } = createMealsBodySchema.parse(
        request.body,
      );

      const { sessionId } = request.cookies;

      const user = await db("user").where("session_id", sessionId).first();

      await db("meal").insert({
        id: crypto.randomUUID(),
        name,
        describe,
        date,
        is_on_diet,
        user_id: user.id,
      });

      return reply.status(201).send();
    },
  );
}
