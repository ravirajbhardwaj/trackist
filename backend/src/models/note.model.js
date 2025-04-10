import mongoose, { Schema } from "mongoose";

const noteSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Note = mongoose.model("Note", noteSchema);
