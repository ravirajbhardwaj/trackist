import { asyncHandler } from "../utils/asyncHandler.js";

const createSubtask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title } = req.body;

  // validation
});

const getSubtasks = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  // validation
});

const getSubtaskById = asyncHandler(async (req, res) => {
  const { taskId, subtaskId } = req.params;

  // validation
});

const updateSubtask = asyncHandler(async (req, res) => {
  const { taskId, subtaskId } = req.params;
  const { title } = req.body;

  // validation
});

const deleteSubtask = asyncHandler(async (req, res) => {
  const { taskId, subtaskId } = req.params;

  // validation
});

const toggleSubtaskCompletion = asyncHandler(async (req, res) => {
  const { taskId, subtaskId } = req.params;

  // validation
});

export {
  createSubtask,
  getSubtasks,
  getSubtaskById,
  updateSubtask,
  deleteSubtask,
  toggleSubtaskCompletion,
};
