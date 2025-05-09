import { Router } from "express";
import { registerUser } from "../controllers/auth.controller.js";
import { userRegisterValidator } from "../validators/user.validator.js";
import { validate } from "../validators/validate.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router
  .route("/register")
  .post(
    upload.single("avatar"),
    userRegisterValidator(),
    validate,
    registerUser
  );

export default router;
