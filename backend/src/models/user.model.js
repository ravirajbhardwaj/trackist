import mongoose, { Schema } from "mongoose";
import {
  AvailableSocialLogins,
  AvailableUserRoles,
  LoginTypesEnum,
  UserRolesEnum,
} from "../constants.js";

const userSchema = new Schema(
  {
    avatar: {
      type: {
        url: String,
        localPath: String,
      },
      default: {
        url: "https://i.pravatar.cc/300",
        localPath: "",
      },
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    eamil: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: AvailableUserRoles,
      default: UserRolesEnum.ADMIN,
      required: true,
    },
    isEmailVarified: {
      type: Boolean,
      default: false,
    },
    loginType: {
      type: String,
      enum: AvailableSocialLogins,
      default: LoginTypesEnum.EMAIL,
    },
    refreshToken: {
      type: String,
    },
    forgetPasswordToken: {
      type: String,
    },
    forgetPasswordExpiry: {
      type: Date,
    },
    emailVarificationToken: {
      type: String,
    },
    emailVarificationExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
