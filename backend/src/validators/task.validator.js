import { body } from "express-validator";
import { AvailablePriorities, AvailableTaskStatus } from "../constants.js";

const taskCreateAndUpdateValidator = () => {
  return [
    body("project").trim().notEmpty().withMessage("Project is required"),
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
    body("priority")
      .trim()
      .notEmpty()
      .withMessage("Description is required")
      .isIn(AvailablePriorities)
      .withMessage("Invalid priority type"),
    body("assignedBy").trim().notEmpty().withMessage("assignedBy is required"),
    body("assignedTo").trim().notEmpty().withMessage("assignedTo is required"),
    body("status")
      .trim()
      .notEmpty()
      .withMessage("Status is required")
      .isIn(AvailableTaskStatus)
      .withMessage("Invalid Status type"),
  ];
};

export { taskCreateAndUpdateValidator };
