import express from "express";

const app = express();

app.use(express.json())

// import api route
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

export { app };
