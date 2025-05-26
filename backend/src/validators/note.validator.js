import { body } from "express-validator";

export const noteCreateAndUpdateValidator = () => {
  return [body("content").trim().notEmpty().withMessage("Content is required")];
};
