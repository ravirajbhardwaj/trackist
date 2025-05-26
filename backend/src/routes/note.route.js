import { Router } from "express";
import {
  createNote,
  deleteNote,
  getNoteById,
  getNotes,
  updateNote,
} from "../controllers/note.controller.js";
import {
  verifyAccessToken,
  verifyPermission,
} from "../middlewares/auth.middleware.js";
import { UserRolesEnum } from "../constants.js";
import { noteCreateAndUpdateValidator } from "../validators/note.validator.js";
import { validate } from "../validators/validate.js";

const router = Router();

router
  .route("/:projectId")
  .get(
    verifyAccessToken,
    verifyPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.MEMBER,
      UserRolesEnum.VIEWER,
    ]),
    getNotes
  )
  .post(
    verifyAccessToken,
    verifyPermission([UserRolesEnum.ADMIN]),
    noteCreateAndUpdateValidator(),
    validate,
    createNote
  );

router
  .route("/:projectId/n/:noteId")
  .get(
    verifyAccessToken,
    verifyPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.MEMBER,
      UserRolesEnum.VIEWER,
    ]),
    getNoteById
  )
  .put(
    verifyAccessToken,
    verifyPermission([UserRolesEnum.ADMIN]),
    noteCreateAndUpdateValidator(),
    validate,
    updateNote
  )
  .delete(
    verifyAccessToken,
    verifyPermission([UserRolesEnum.ADMIN]),
    deleteNote
  );

export default router;
