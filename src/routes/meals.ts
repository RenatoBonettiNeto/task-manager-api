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

  app.get("/", { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies;

    const user = await db("user").where("session_id", sessionId).first();
    const meals = await db("meal").where("user_id", user.id).select();

    return {
      meals,
    };
  });

  app.get("/:id", { preHandler: [checkSessionIdExists] }, async (request) => {
    const getMealsParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getMealsParamsSchema.parse(request.params);

    const { sessionId } = request.cookies;

    const user = await db("user").where("session_id", sessionId).first();
    const meal = await db("meal")
      .where("user_id", user.id)
      .andWhere("id", id)
      .first();

    return {
      meal,
    };
  });

  app.get(
    "/summary",
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const { sessionId } = request.cookies;

      const user = await db("user").where("session_id", sessionId).first();

      const totalMeals = await db("meal")
        .where("user_id", user.id)
        .count({ total: "*" })
        .first();

      const mealsOnDiet = await db("meal")
        .where("user_id", user.id)
        .andWhere("is_on_diet", true)
        .count({ total: "*" })
        .first();

      const mealsOffDiet = await db("meal")
        .where("user_id", user.id)
        .andWhere("is_on_diet", false)
        .count({ total: "*" })
        .first();

      const mealsBestSequence = await db("meal")
        .where("user_id", user.id)
        .orderBy("date", "asc");

      let currentSequence = 0;
      let bestSequence = 0;

      for (const meal of mealsBestSequence) {
        if (meal.is_on_diet) {
          currentSequence++;

          if (currentSequence > bestSequence) {
            bestSequence = currentSequence;
          }
        } else {
          currentSequence = 0;
        }
      }

      return {
        totalMeals: Number(totalMeals?.total),
        mealsOnDiet: Number(mealsOnDiet?.total),
        mealsOffDiet: Number(mealsOffDiet?.total),
        bestDietSequence: bestSequence,

      };
    },
  );
}
