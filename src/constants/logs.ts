export const logsConstants = {
  addNewUser: (userName: string, isFromAdminPanel = false) =>
    ":raising_hand: `" +
    userName +
    "` has been added to the list of users" +
    (isFromAdminPanel ? " from the admin panel" : "") +
    ".",

  addNewSupervisor: (userName: string, roleName: string) =>
    ":mega: `" +
    userName +
    "` has been designated as the new `" +
    roleName +
    "`.",

  selectRandomSupervisor: (userName: string, roleName: string) =>
    ":mega: `" +
    userName +
    "` has been selected as the new `" +
    roleName +
    "`.",

  updateTeammate: (userName: string) =>
    ":pencil2: The information of the user `" +
    userName +
    "` has been updated from the admin panel.",

  deactivateTeammate: (userName: string) =>
    ":no_entry_sign: The user `" +
    userName +
    "` has been deactivated from the admin panel.",
};
