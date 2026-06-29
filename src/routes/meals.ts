import type { FastifyInstance } from "fastify";
import { z, ZodError } from "zod";
import { db } from "../database.js";
import crypto from "node:crypto";
import { checkSessionIdExists } from "../middleware/check-session-id.js";

export function mealRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    console.log(`[${request.method}] ${request.url}`);
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: "Dados inválidos.",
        issues: error.issues,
      });
    }

    return reply.status(500).send({
      error: "Erro interno do servidor.",
    });
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

  app.put(
    "/:id",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const updateMealsBodySchema = z.object({
        name: z.string(),
        describe: z.string(),
        date: z.coerce.date(),
        is_on_diet: z.boolean(),
      });

      const updateMealParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { sessionId } = request.cookies;

      const { id } = updateMealParamsSchema.parse(request.params);

      const { name, describe, date, is_on_diet } = updateMealsBodySchema.parse(
        request.body,
      );
      const user = await db("user").where("session_id", sessionId).first();
      const meal = await db("meal")
        .where("user_id", user.id)
        .andWhere("id", id)
        .first();

      if (!meal) {
        return reply.status(404).send({
          error: "Refeição não encontrada.",
        });
      }

      await db("meal")
        .update({
          name,
          describe,
          date,
          is_on_diet,
        })
        .where("user_id", user.id)
        .andWhere("id", id);

      return reply.status(204).send();
    },
  );

  app.delete(
    "/:id",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const deleteMealParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { sessionId } = request.cookies;

      const { id } = deleteMealParamsSchema.parse(request.params);

      const user = await db("user").where("session_id", sessionId).first();
      const meal = await db("meal")
        .where("user_id", user.id)
        .andWhere("id", id)
        .first();

      if (!meal) {
        return reply.status(404).send({
          error: "Refeição não encontrada.",
        });
      }

      await db("meal").delete().where("user_id", user.id).andWhere("id", id);

      return reply.status(204).send();
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
