import { Router } from "express";
import {
  addAttachments,
  createSubtask,
  createTask,
  deleteAttachments,
  deleteSubtask,
  deleteTask,
  getSubtaskById,
  getSubtasks,
  getTaskById,
  getTasks,
  toggleSubTaskCompletion,
  toggleTaskCompletion,
  updateSubtask,
  updateTask,
} from "../controllers/task.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// task routes
router
  .route("/")
  .get(verifyAccessToken, getTasks)
  .post(verifyAccessToken, upload.single("attachments"), createTask);

router
  .route("/:taskId")
  .get(verifyAccessToken, getTaskById)
  .put(verifyAccessToken, updateTask)
  .delete(verifyAccessToken, deleteTask);

// Subtask routes
router
  .route("/:taskId/subtasks")
  .get(verifyAccessToken, getSubtasks)
  .post(verifyAccessToken, createSubtask);

router
  .route("/:taskId/subtasks/:subtaskId")
  .get(verifyAccessToken, getSubtaskById)
  .put(verifyAccessToken, updateSubtask)
  .delete(verifyAccessToken, deleteSubtask);

// Toggle completion status of task or subtask
router.put("/:taskId/toggle", toggleTaskCompletion);
router.put("/:taskId/subtasks/:subtaskId/toggle", toggleSubTaskCompletion);

// Attachment routes
router.post("/:taskId/attachments", addAttachments);
router.delete("/:taskId/attachments", deleteAttachments);

export default router;
