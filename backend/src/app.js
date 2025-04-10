import express from "express";

const app = express();

// api route
import healthcheckRouter from "./routes/healthcheck.route.js";

// * healthcheck
app.use("/api/v1/healthcheck", healthcheckRouter);

export { app };
