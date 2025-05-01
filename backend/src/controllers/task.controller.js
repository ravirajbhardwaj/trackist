import { asyncHandler } from "../utils/asyncHandler.js";

const getTasks = asyncHandler(async (req, res) => {
  // get all tasks
});

// get task by id
const getTaskById = asyncHandler(async (req, res) => {
  // get task by id
});

// create task
const createTask = asyncHandler(async (req, res) => {
  // create task
});

// update task
const updateTask = asyncHandler(async (req, res) => {
  // update task
});

// delete task
const deleteTask = asyncHandler(async (req, res) => {
  // delete task
});

export {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
};
