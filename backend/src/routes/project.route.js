import { Router } from "express";
import {
  addTeamMemberToProject,
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  getTeamMembers,
  removeTeamMember,
  updateProject,
  updateTeamMemberRole,
} from "../controllers/project.controller.js";
import {
  verifyAccessToken,
  verifyPermission,
} from "../middlewares/auth.middleware.js";
import { validate } from "../validators/validate.js";
import {
  projectCreateAndUpdateValidator,
  projectTeamMemberValidator,
} from "../validators/project.validator.js";
import { TeamMemberRolesEnums, UserRolesEnum } from "../constants.js";

const router = Router();

// Project routes
router
  .route("/")
  .get(
    verifyAccessToken,
    verifyPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.MEMBER,
      UserRolesEnum.VIEWER,
    ]),
    getProjects
  )
  .post(
    verifyAccessToken,
    verifyPermission([UserRolesEnum.ADMIN]),
    projectCreateAndUpdateValidator(),
    validate,
    createProject
  );
router
  .route("/:projectId")
  .get(verifyAccessToken, getProjectById)
  .put(
    verifyAccessToken,
    verifyPermission([UserRolesEnum.ADMIN]),
    projectCreateAndUpdateValidator(),
    validate,
    updateProject
  )
  .delete(
    verifyAccessToken,
    verifyPermission([UserRolesEnum.ADMIN]),
    deleteProject
  );

// TeamMember routes
router
  .route("/:projectId/team")
  .get(
    verifyAccessToken,
    verifyPermission([UserRolesEnum.ADMIN, TeamMemberRolesEnums.LEADER]),
    getTeamMembers
  )
  .post(
    verifyAccessToken,
    verifyPermission([UserRolesEnum.ADMIN, TeamMemberRolesEnums.LEADER]),
    projectTeamMemberValidator(),
    validate,
    addTeamMemberToProject
  );

router
  .route("/:projectId/t/:memberId")
  .put(
    verifyAccessToken,
    verifyPermission([UserRolesEnum.ADMIN, TeamMemberRolesEnums.LEADER]),
    updateTeamMemberRole
  )
  .delete(
    verifyAccessToken,
    verifyPermission([UserRolesEnum.ADMIN, TeamMemberRolesEnums.LEADER]),
    removeTeamMember
  );

export default router;
