/**
 * @type {{ADMIN: "ADMIN", MEMBER: "MEMBER", VIEWER: "VIEWER"} as const}
 */
export const UserRolesEnum = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
  VIEWER: "VIEWER",
};

export const AvailableUserRoles = Object.values(UserRolesEnum);

/**
 * @type {{GOOGLE: "GOOGLE", GITHUB: "GITHUB", EMAIL: "EMAIL"} as const}
 */
export const LoginTypesEnum = {
  GOOGLE: "GOOGLE",
  GITHUB: "GITHUB",
  EMAIL: "EMAIL",
};

export const AvailableSocialLogins = Object.values(LoginTypesEnum);

/**
 * @type {{TODO: "TODO", IN_PROGRESS: "IN_PROGRESS", DONE: "DONE"} as const}
 */
export const TaskStatusEnums = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
};

export const AvailableTaskStatus = Object.values(TaskStatusEnums);

/**
 * @type {{LOW: "LOW", MEDIUM: "MEDIUM", HIGH: "HIGH", URGENT: "URGENT"} as const}
 */
export const TaskPriorityEnums = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
};

export const AvailablePriorities = Object.values(TaskPriorityEnums);

/**
 * @type {{LEADER: "LEADER", MANAGER: "MANAGER", DEVELOPER: "DEVELOPER", TESTER: "TESTER", INTERN: "INTERN", }}
 */
export const TeamMemberRolesEnums = {
  LEADER: "LEADER",
  MANAGER: "MANAGER",
  DEVELOPER: "DEVELOPER",
  DESIGNER: "DESIGNER",
  TESTER: "TESTER",
  INTERN: "INTERN",
  CONTRIBUTOR: "CONTRIBUTOR",
};

export const AvailableTeamMemberRoles = Object.values(TeamMemberRolesEnums);

export const DB_NAME = "trackist";
