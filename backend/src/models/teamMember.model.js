import mongoose, { Schema } from "mongoose";
import {
  AvailableTeamMemberRoles,
  TeamMemberRolesEnums,
} from "../constants.js";

const teamMemberSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    role: {
      type: String,
      enum: AvailableTeamMemberRoles,
      default: TeamMemberRolesEnums.LEADER,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
  },
  { timestamps: true }
);

export const TeamMember = mongoose.model("TeamMember", teamMemberSchema);
