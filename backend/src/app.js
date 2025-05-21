import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";

const app = express();

const corsOptions = {
  origin:
    process.env.CORS_ORIGIN === "*" ? "*" : process.env.CORS_ORIGIN?.split(","),
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "12kb" }));
app.use(express.urlencoded({ extended: true, limit: "12kb" }));
app.use(cookieParser());

const __dirname = path.resolve();
app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: 3600,
  })
);

// import api route
import { errorHandler } from "./middlewares/error.middleware.js";
import healthcheckRouter from "./routes/healthcheck.route.js";
import userRouter from "./routes/user.route.js";
import projectRouter from "./routes/project.route.js";
import projectMemberRouter from "./routes/projectmember.route.js";
import taskRouter from "./routes/task.route.js";
import subtaskRouter from "./routes/subtask.route.js";
import noteRouter from "./routes/note.route.js";

// healthcheck route
app.use("/api/v1/healthcheck", healthcheckRouter);

// application route
app.use("/api/v1/users", userRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/team-member", projectMemberRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/subtasks", subtaskRouter);
app.use("/api/v1/notes", noteRouter);

app.use(errorHandler);

export { app };
