// teamMemberController.js
import { asyncHandler } from "../utils/asyncHandler.js";

const addTeamMember = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { userId, role } = req.body;

  // validation
});

const getTeamMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  // validation
});

const getTeamMember = asyncHandler(async (req, res) => {
  const { projectId, memberId } = req.params;

  // validation
});

const updateTeamMemberRole = asyncHandler(async (req, res) => {
  const { projectId, memberId } = req.params;
  const { role } = req.body;

  // validation
});

const removeTeamMember = asyncHandler(async (req, res) => {
  const { projectId, memberId } = req.params;

  // validation
});

export {
  addTeamMember,
  getTeamMembers,
  getTeamMember,
  updateTeamMemberRole,
  removeTeamMember,
};
