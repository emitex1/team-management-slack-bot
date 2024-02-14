import { Role } from "../entities/Role";

export type RoleServiceType = {
  createRole: (title: string) => Promise<Role>;
  readAll: () => Promise<Role[]>;
  isValidRole: (title: string) => Promise<boolean>;
};
