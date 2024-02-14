export type GeneralServiceType = {
  clearAll: () => Promise<boolean>;
  initializeCandidates: () => Promise<boolean>;
  initializeRoles: () => Promise<boolean>;
};
