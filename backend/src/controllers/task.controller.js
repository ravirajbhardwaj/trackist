import path from "path";
import { TaskPriorityEnums } from "../constants.js";
import { Task } from "../models/task.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadToImageKit } from "../utils/imageKit.js";
import { Subtask } from "../models/subtask.model.js";

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

  const task = await Task.findByIdAndUpdate(
    taskId,
    {
      title,
      description,
      status,
      assignedTo,
      priority,
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

  if (!title && !taskId) {
    throw new ApiError(400, "Task Id and title is required");
  }

  const task = Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task does not exists");
  }

  const subTask = await Subtask.create({
    task: task._id,
    title,
    createdBy: req.user?._id,
  });

  const poplatedSubTask = Subtask.findById(subTask)
    .populate("createdBy", "username role avatar")
    .populate("task", "title description assignedBy assignedTo priority");

  return res
    .status(200)
    .json(
      new ApiResponse(201, "Subtask created successfully", poplatedSubTask)
    );
});

const getSubtasks = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [subTasks, totalSubTasks] = await Promise.all([
    Subtask.find().skip(skip).limit(limit),
    Subtask.countDocuments(),
  ]);

  if (!subTasks || subTasks.length === 0) {
    throw new ApiError(404, "SubTask not found");
  }

  return res.status(200).json(
    new ApiResponse(200, "SubTasks fetch successfully", {
      totalSubTasks,
      tatalPages: Math.ceil(totalSubTasks / limit),
      currentPage: page,
      subTasks,
    })
  );
});

const getSubtaskById = asyncHandler(async (req, res) => {
  const { taskId, subtaskId } = req.params;

  if (!taskId && !subtaskId) {
    throw new ApiError(400, "Task and Subtask id is required");
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const subtask = await Subtask.findById(subtaskId);

  if (!subtask) {
    throw new ApiError(404, "Subtask not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "SubTask fetch by Id", subtask));
});

const updateSubtask = asyncHandler(async (req, res) => {
  const { taskId, subtaskId } = req.params;
  const { title, status } = req.body;

  if (!taskId || !subtaskId) {
    throw new ApiError(400, "Task ID and Subtask ID are required");
  }

  if (!title && !status) {
    throw new ApiError(
      400,
      "At least one field (title or status) must be provided to update"
    );
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const subtask = await Subtask.findById(subtaskId);

  if (!subtask) {
    throw new ApiError(404, "Subtask not found");
  }

  if (title) subtask.title = title;
  if (status) subtask.status = status;

  await subtask.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Subtask updated successfully", subtask));
});

const deleteSubtask = asyncHandler(async (req, res) => {
  const { taskId, subtaskId } = req.params;

  if (!taskId || !subtaskId) {
    throw new ApiError(400, "Task ID and Subtask ID are required");
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const subtask = await Subtask.findById(subtaskId);

  if (!subtask) {
    throw new ApiError(404, "Subtask not found");
  }

  const deletedSubtask = await Subtask.findByIdAndDelete(subtask._id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Subtask deleted successfully", deletedSubtask));
});

const toggleSubTaskCompletion = asyncHandler(async (req, res) => {
  const { taskId, subtaskId } = req.params;

  if (!taskId && !subtaskId) {
    throw new ApiError(400, "Task and SubTask Id is required");
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const subTask = await Subtask.findByIdAndUpdate(
    subtaskId,
    { isCompleted: true },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Task status toggled", subTask));
});

const addAttachments = asyncHandler(async (req, res) => {
  const attachmentsLocalPath = req.file.path;
  const attachmentsFileName = req.file.filename;
  const { taskId } = req.params;

  if (!taskId) {
    throw new ApiError(401, "Task id is required");
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task does not exist");
  }

  const absoluteAvatarPath = path.resolve(avatarLocalPath);

  // Validate that an avatar file was uploaded
  if (!attachmentsLocalPath && !attachmentsFileName) {
    throw new ApiError(400, "Attachments is required");
  }

  // Upload the avatar image to Cloudinary and get the URL
  let imageKitAttachments = await uploadToImageKit(
    absoluteAvatarPath,
    attachmentsFileName
  );

  const attachmentsUpload = await Task.findByIdAndUpdate(task._id, {
    attachments: [{ url: imageKitAttachments, size: 1 }],
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Attachments upload successfully", attachmentsUpload)
    );
});

const deleteAttachments = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  if (!taskId) {
    throw new ApiError(401, "Task id is required");
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task does not exist");
  }

  const deletedAttachments = await Task.updateOne(
    { _id: task._id },
    { $set: { attachments: [] } }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Attachments deleted successfully",
        deletedAttachments
      )
    );
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
  toggleSubTaskCompletion,
  addAttachments,
  deleteAttachments,
};
