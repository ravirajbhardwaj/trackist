import mongoose, { Schema } from "mongoose";

const subtaskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Subtask = mongoose.model("Subtask", subtaskSchema);
