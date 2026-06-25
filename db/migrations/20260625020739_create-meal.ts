import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("meal", (table) => {
    table.uuid("id").primary();
    table.text("name").notNullable();
    table.text("describe").notNullable();
    table.datetime("date").notNullable();
    table.boolean("is_on_diet").notNullable();
    table.uuid("user_id").notNullable();
    table.foreign("user_id").references("id").inTable("user")
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("meal");
}
