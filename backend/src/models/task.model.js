import mongoose, { Schema } from "mongoose";
import {
  AvailablePriorities,
  AvailableTaskStatus,
  TaskPriorityEnums,
  TaskStatusEnums,
} from "../constants.js";

const taskSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    priority: {
      type: String,
      enum: AvailablePriorities,
      default: TaskPriorityEnums.MEDIUM,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: AvailableTaskStatus,
      default: TaskStatusEnums.TODO,
    },
    attachments: {
      type: [
        {
          url: String,
          size: Number,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const Task = mongoose.model("Task", taskSchema);
