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
  updateSubtask,
  updateTask,
} from "../controllers/task.controller.js";
import {
  verifyAccessToken,
  verifyPermission,
} from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { UserRolesEnum } from "../constants.js";
import { validate } from "../validators/validate.js";
import { taskCreateAndUpdateValidator } from "../validators/task.validator.js";

const router = Router();

// task routes
router
  .route("/")
  .get(verifyAccessToken, getTasks)
  .post(
    verifyAccessToken,
    verifyPermission([UserRolesEnum.ADMIN]),
    taskCreateAndUpdateValidator(),
    validate,
    createTask
  );

router
  .route("/:taskId")
  .get(verifyAccessToken, getTaskById)
  .put(
    verifyAccessToken,
    verifyPermission([UserRolesEnum.ADMIN]),
    taskCreateAndUpdateValidator(),
    validate,
    updateTask
  )
  .delete(
    verifyAccessToken,
    verifyPermission([UserRolesEnum.ADMIN]),
    deleteTask
  );

// Subtask routes
router
  .route("/:taskId/subtasks")
  .get(verifyAccessToken, getSubtasks)
  .post(
    verifyAccessToken,
    verifyPermission([UserRolesEnum.ADMIN]),
    createSubtask
  );

router
  .route("/:taskId/subtasks/:subtaskId")
  .get(verifyAccessToken, getSubtaskById)
  .put(
    verifyAccessToken,
    verifyPermission([UserRolesEnum.ADMIN]),
    updateSubtask
  )
  .delete(
    verifyAccessToken,
    verifyPermission([UserRolesEnum.ADMIN]),
    deleteSubtask
  );

// Toggle completion status of task or subtask
router
  .route("/:taskId/subtasks/:subtaskId/toggle")
  .put(
    verifyAccessToken,
    verifyPermission([UserRolesEnum.ADMIN]),
    toggleSubTaskCompletion
  );

// Attachment routes
router
  .route("/:taskId/attachments")
  .post(
    verifyAccessToken,
    verifyPermission([UserRolesEnum.ADMIN]),
    upload.single("attachments"),
    addAttachments
  );

router
  .route("/:taskId/attachments")
  .delete(
    verifyAccessToken,
    verifyPermission([UserRolesEnum.ADMIN]),
    upload.single("attachments"),
    deleteAttachments
  );

export default router;
