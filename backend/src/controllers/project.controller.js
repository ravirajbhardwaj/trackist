import { asyncHandler } from "../utils/asyncHandler.js";
import { Project } from "../models/project.model.js";
import { TeamMember } from "../models/teamMember.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";

const getProjects = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [projects, totalProjects] = await Promise.all([
    Project.find().skip(skip).limit(limit),
    Project.countDocuments(),
  ]);

  if (!projects || projects.length === 0) {
    throw new ApiError(404, "No projects found");
  }

  return res.status(200).json(
    new ApiResponse(200, "Projects fetched successfully", {
      totalProjects,
      totalPages: Math.ceil(totalProjects / limit),
      currentPage: page,
      projects,
    })
  );
});

const getProjectById = asyncHandler(async (req, res) => {
  // get project by id
  const projectId = req.params.projectId;

  // validation
  if (!projectId) {
    throw new ApiError(400, "Project id must be required", []);
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(429, "Project does not exist", []);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Projects fetched successfully", project));
});

const createProject = asyncHandler(async (req, res) => {
  // get data from body
  const { name, description } = req.body;

  // validation
  if (!name) {
    throw new ApiError(400, "Project name is required");
  }

  // Check if a project with the given name already exists
  const existedProject = await Project.findOne({ name });

  if (existedProject) {
    throw new ApiError(429, "A project with this name already exists");
  }

  const project = await Project.create({
    name,
    description,
  });

  // Respond with a success message indicating that the project was created successfully.
  return res
    .status(201)
    .json(new ApiResponse(200, "Project created successfully", project));
});

const updateProject = asyncHandler(async (req, res) => {
  // get project by id
  const { name, description } = req.body;
  const projectId = req.params.projectId;

  // validation
  if (!projectId) {
    throw new ApiError(400, "Project id must be required", []);
  }

  if (!name) {
    throw new ApiError(400, "Project name is required");
  }

  const project = await Project.findByIdAndUpdate(projectId, {
    $set: {
      name,
      description,
    },
  });

  if (!project) {
    throw new ApiError(429, "Project does not exist", []);
  }

  await project.save({ validateBeforeSave: false });

  // Respond with a success message indicating that the project was update successfully.
  return res
    .status(200)
    .json(new ApiResponse(200, "Project updated successfully"));
});

const deleteProject = asyncHandler(async (req, res) => {
  // delete project
  const projectId = req.params.projectId;

  // validation
  if (!projectId) {
    throw new ApiError(400, "Project id must be required", []);
  }

  const project = await Project.findByIdAndDelete(projectId);

  if (!project) {
    throw new ApiError(429, "Project does not exist", []);
  }

  // Respond with a success message indicating that the project was update successfully.
  return res
    .status(200)
    .json(new ApiResponse(200, "Project deleted successfully", project));
});

const addTeamMemberToProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { role, userId } = req.body;

  if ([projectId, role, userId].some(filed => filed?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project does not exist");
  }

  // check already added to team
  const userExistInTeam = await TeamMember.findOne({
    user: new mongoose.Types.ObjectId(userId),
  });

  if (userExistInTeam) {
    throw new ApiError(429, "User already exist in Team");
  }

  const memberToAdd = await TeamMember.create({
    user: new mongoose.Types.ObjectId(userId),
    role,
    project: new mongoose.Types.ObjectId(projectId),
  });

  if (!memberToAdd) {
    throw new ApiError(500, "Something went wrong while added user to project");
  }

  const popluatedTeamMember = await TeamMember.findById(
    memberToAdd._id
  ).populate("user", "username role avatar");

  return res
    .status(201)
    .json(new ApiResponse(200, "Add member to project", popluatedTeamMember));
});

const getTeamMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [teamMembers, totalTeamMembers] = await Promise.all([
    TeamMember.find({ project: projectId }).skip(skip).limit(limit),
    TeamMember.countDocuments(),
  ]);

  if (!teamMembers || teamMembers.length === 0) {
    throw new ApiError(404, "No teamMembers found");
  }

  return res.status(200).json(
    new ApiResponse(200, "TeamMembers fetch successfully", {
      totalTeamMembers,
      totalPages: Math.ceil(totalTeamMembers / limit),
      currentPage: page,
      teamMembers,
    })
  );
});

const updateTeamMemberRole = asyncHandler(async (req, res) => {
  const { projectId, memberId } = req.params;
  const { role } = req.body;

  // validation
  if ([projectId, role, memberId].some(field => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project does not exist");
  }

  const existInTeam = await TeamMember.findById(memberId);

  if (!existInTeam) {
    throw new ApiError(404, "Team member does not exist");
  }

  if (existInTeam.role === role) {
    throw new ApiError(400, "This user already has the same role");
  }

  existInTeam.role = role;
  await existInTeam.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "Team member role updated", existInTeam));
});

const removeTeamMember = asyncHandler(async (req, res) => {
  const { projectId, memberId } = req.params;

  // validation
  if ([projectId, memberId].some(filed => filed?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project does not exist");
  }

  const memberToDelete = await TeamMember.findByIdAndDelete(memberId);

  if (!memberToDelete) {
    throw new ApiError(404, "Team member not found in this project");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Team member removed successfully", memberToDelete)
    );
});

export {
  createProject,
  getProjectById,
  getProjects,
  deleteProject,
  updateProject,
  getTeamMembers,
  addTeamMemberToProject,
  removeTeamMember,
  updateTeamMemberRole,
};
