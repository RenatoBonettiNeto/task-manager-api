import { Knex } from "knex";

declare module 'knex/types/tables' {
    export interface Tables {
        user: {
            id: string
            name: string
            created_at: string
            session_id?: string
        },
        meal: {
            id: string
            name: string
            describe: string
            date: string
            is_on_diet: boolean
        }

    }
}