import { UserRolesEnum } from "../constants.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { emailVerificationMailgenContent, sendMail } from "../utils/mail.js";
import { uploadToImageKit } from "../utils/imageKit.js";

const registerUser = asyncHandler(async (req, res) => {
  // Retrieves the user info from the request body.
  const { username, email, password, role } = req.body;

  // Validates the user info.
  if ([username, email, password, role].some(filed => filed?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  if (!(username === username?.toLocaleLowerCase())) {
    throw new ApiError(400, "Username must be lowercase");
  }

  // Check if a user with the provided username or email already exists in the database.
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with username or email already exists", []);
  }

  // Retrieves the user image from the request file.
  const avatar = req.file;
  const avatarLocalPath = avatar?.path;

  let imageKitAvatar;

  if (avatarLocalPath) {
    imageKitAvatar = await uploadToImageKit(avatarLocalPath);
  } else {
    // Set a default avatar URL if no avatar is provided
    imageKitAvatar = { url: "https://i.pravatar.cc/300" };
  }

  // If the user does not exist, proceed to create a new user
  const user = await User.create({
    avatar: { path: imageKitAvatar.url },
    username,
    email,
    password,
    isEmailVerified: false,
    role: role ?? UserRolesEnum.USER,
  });

  // Generate a verification token and its expiry time
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  // Save the generated verification token and its expiry time in the database
  user.emailVarificationToken = hashedToken;
  user.emailVarificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  // Send a verification email to the user with a link to verify their email address
  await sendMail({
    email: user?.eamil,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user?.username,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
    ),
  });

  // Exclude sensitive fields like password and refreshToken from the response for security purposes
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // Respond with a success message indicating that the user was created successfully.
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdUser },
        "Users registered successfully and verification email has been sent on your email"
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const logoutUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});
const resetForgottenPassword = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

export {
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgottenPassword,
  verifyEmail,
};
