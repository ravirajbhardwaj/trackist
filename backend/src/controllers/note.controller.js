import { asyncHandler } from "../utils/asyncHandler.js";

const getNotes = asyncHandler(async (req, res) => {
  // get all notes
});

const getNoteById = asyncHandler(async (req, res) => {
  // get note by id
});

const createNote = asyncHandler(async (req, res) => {
  // create note
});

const updateNote = asyncHandler(async (req, res) => {
  // update note
});

const deleteNote = asyncHandler(async (req, res) => {
  // delete note
});

export { createNote, deleteNote, getNoteById, getNotes, updateNote };
