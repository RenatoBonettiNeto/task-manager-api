import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("user", (table) => {
    table.uuid("session_id").after("id").unique();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("user", (table) => {
    table.dropColumn("session_id");
  });
}
