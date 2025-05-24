import { Project } from "../models/project.model.js";
import { Note } from "../models/note.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const getNotes = asyncHandler(async (req, res) => {
  // get all notes
});

const getNoteById = asyncHandler(async (req, res) => {
  const { projectId, noteId } = req.params;

  if (!projectId && !noteId) {
    throw new ApiError(400, "Project & Note id is required");
  }

  const note = await Note.findById(noteId).populate(
    "createdBy",
    "username role avatar"
  );

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(201, "Note fetch successfully", note));
});

const createNote = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { content } = req.body;

  if (!projectId && !content) {
    throw new ApiError(400, "Project id and content is required");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  const note = await Note.create({
    project: mongoose.Types.ObjectId(projectId),
    content,
    createdBy: mongoose.Types.ObjectId(req.user._id),
  });

  const populatedNote = await Note.findById(note._id).populate(
    "createBy",
    "username role avatar"
  );

  return res
    .status(200)
    .json(new ApiResponse(201, "Note created successfully", populatedNote));
});

const updateNote = asyncHandler(async (req, res) => {
  const { projectId, noteId } = req.params;
  const { content } = req.body;

  if (!projectId && !noteId && !content) {
    throw new ApiError(400, "Project & Note id and content is required");
  }

  const existedNote = await Note.findById(noteId);

  if (!existedNote) {
    throw new ApiError(404, "Note does not exist");
  }
  const note = await Note.findByIdAndUpdate(
    noteId,
    { content },
    { new: true }
  ).populate("createBy", "username role avatar");

  return res
    .status(200)
    .json(new ApiResponse(201, "Note updated successfully", note));
});

const deleteNote = asyncHandler(async (req, res) => {
  const { projectId, noteId } = req.params;

  if (!projectId && !noteId) {
    throw new ApiError(400, "Project& Note id is required");
  }

  const deletedNote = await Note.findByIdAndDelete(noteId);

  if (!deletedNote) {
    throw new ApiError(404, "Note does not exist");
  }

  return res.status(200).json(200, "Note delete successfully", deletedNote);
});

export { createNote, deleteNote, getNoteById, getNotes, updateNote };
