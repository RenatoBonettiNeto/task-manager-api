import { app } from "./app";
import { env } from "../env/env";

app
  .listen({
    host: "0.0.0.0",
    port: env.PORT,
  })
  .then(() => console.log("Iniciado em http://localhost:3333."));
