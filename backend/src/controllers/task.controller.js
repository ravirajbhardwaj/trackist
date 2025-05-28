import { TaskPriorityEnums } from "../constants.js";
import { Task } from "../models/task.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getTasks = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [tasks, totalTasks] = await Promise.all([
    Task.find().skip(skip).limit(limit),
    Task.countDocuments(),
  ]);

  if (!tasks || tasks.length === 0) {
    throw new ApiError(404, "Task not found");
  }

  return res.status(200).json(
    new ApiResponse(200, "Tasks fetch successfully", {
      totalTasks,
      tatalPages: Math.ceil(totalTasks / limit),
      currentPage: page,
      tasks,
    })
  );
});

const getTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  if (!taskId) {
    throw new ApiError(400, "Task id is required");
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const poplatedTask = await Task.findById(task._id)
    .populate("project", "name _id")
    .populate("assignedBy", "username role avatar")
    .populate("assignedTo", "username role avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, "Task fetch successfully", poplatedTask));
});

const createTask = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    status = "TODO",
    assignedTo,
    priority = "MEDIUM",
    projectId,
  } = req.body;
  const userId = req.user._id;
  const attachments = req.files;

  const existedTask = await Task.findOne({ title });

  if (existedTask) {
    throw new ApiError(429, "Task with title already exist");
  }

  const task = await Task.create({
    project: projectId,
    title,
    description,
    assignedBy: userId,
    assignedTo,
    priority: priority ?? TaskPriorityEnums.MEDIUM,
    status,
    attachments: "" ?? attachments,
  });

  if (!task) {
    throw new ApiError(500, "Something went wrong while created the task");
  }

  const poplatedTask = await Task.findById(task._id)
    .populate("project", "name _id")
    .populate("assignedBy", "username role avatar")
    .populate("assignedTo", "username role avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, "Task created successfully", poplatedTask));
});

const updateTask = asyncHandler(async (req, res) => {
  const { title, description, status, assignedTo, priority, taskId } = req.body;
  const attachments = req.files;

  const task = await Task.findByIdAndUpdate(
    taskId,
    {
      title,
      description,
      status,
      assignedTo,
      priority,
      attachments,
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Task updated successfully", task));
});

const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  if (!taskId) {
    throw new ApiError(400, "Task id is required");
  }

  const deletedTask = await Task.findByIdAndDelete(taskId);

  if (!deletedTask) {
    throw new ApiError(404, "Something went wrong while deleting task");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Task deleted successfully", deletedTask));
});

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

const toggleTaskCompletion = asyncHandler(async (req, res) => {
  const { taskId, subtaskId } = req.params;

  // validation
});

const toggleSubTaskCompletion = asyncHandler(async (req, res) => {
  const { taskId, subtaskId } = req.params;

  // validation
});

const addAttachments = asyncHandler(async (req, res) => {
  //
});

const deleteAttachments = asyncHandler(async (req, res) => {
  //
});

export {
  createTask,
  createSubtask,
  getTasks,
  getTaskById,
  getSubtasks,
  getSubtaskById,
  updateTask,
  updateSubtask,
  deleteTask,
  deleteSubtask,
  toggleTaskCompletion,
  toggleSubTaskCompletion,
  addAttachments,
  deleteAttachments,
};
