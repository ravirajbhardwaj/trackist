import { Router } from "express";
import {
  createNote,
  deleteNote,
  getNoteById,
  getNotes,
  updateNote,
} from "../controllers/note.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/:projectId")
  .get(verifyAccessToken, getNotes)
  .post(verifyAccessToken, createNote);

router
  .route("/projectId/n/:noteId")
  .get(verifyAccessToken, getNoteById)
  .put(verifyAccessToken, updateNote)
  .delete(verifyAccessToken, deleteNote);

export default router;
