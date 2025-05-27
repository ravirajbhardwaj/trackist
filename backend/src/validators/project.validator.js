import { body } from "express-validator";
import { AvailableTeamMemberRoles } from "../constants.js";
import mongoose from "mongoose";

const projectCreateAndUpdateValidator = () => {
  return [
    body("name").trim().notEmpty().withMessage("Project Name is required"),
    body("description")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
  ];
};

const projectTeamMemberValidator = () => {
  return [
    body("role")
      .trim()
      .notEmpty()
      .withMessage("Role is required")
      .isIn(AvailableTeamMemberRoles)
      .withMessage("Invalid team role"),

    body("userId").trim().notEmpty().withMessage("User ID is required"),
  ];
};

export { projectCreateAndUpdateValidator, projectTeamMemberValidator };
