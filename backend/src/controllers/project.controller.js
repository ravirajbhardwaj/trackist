import { asyncHandler } from "../utils/asyncHandler.js";

const getProjects = asyncHandler(async (req, res) => {
  // get all projects
});

const getProjectById = asyncHandler(async (req, res) => {
  // get project by id
});

const createProject = asyncHandler(async (req, res) => {
  // create project
});

const updateProject = asyncHandler(async (req, res) => {
  // update project
});

const deleteProject = asyncHandler(async (req, res) => {
  // delete project
});

const getProjectMembers = asyncHandler(async (req, res) => {
  // get project members
});

const addMemberToProject = asyncHandler(async (req, res) => {
  // add member to project
});

const deleteMember = asyncHandler(async (req, res) => {
  // delete member from project
});

const updateMemberRole = asyncHandler(async (req, res) => {
  // update member role
});

export {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProject,
};
