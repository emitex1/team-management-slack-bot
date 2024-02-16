import { Role } from "../entities/Role";
import { AppDataSource } from "../entities/dataSource";

export const RoleService = {
  createRole: async (title: string) => {
    const roleRepository = AppDataSource.getRepository(Role);
    const role = new Role();
    role.title = title;
    return await roleRepository.save(role);
  },

  readAll: async () => {
    const roleRepository = AppDataSource.getRepository(Role);
    const roles = await roleRepository.find();
    return roles;
  },

  getRoleByName: async (title: string) => {
    const roleRepository = AppDataSource.getRepository(Role);
    const role = await roleRepository
      .createQueryBuilder()
      .select("*")
      .where(`LOWER(title) = '${title.toLowerCase()}'`)
      .getRawOne();
    return role;
  },

  isValidRole: async (title: string) => {
    return !!RoleService.getRoleByName(title);
  },
};
