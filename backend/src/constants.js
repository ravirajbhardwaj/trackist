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
 * @type {{GITHUB: "GITHUB", EMAIL: "EMAIL"} as const}
 */
export const LoginTypesEnum = {
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

export const USER_TEMPORARY_TOKEN_EXPIRY = 10 * 60 * 1000; // 10m

export const USER_COOKIE_TOKEN_EXPIRY = 15 * 60 * 100; // 15m

export const DB_NAME = "trackist";
