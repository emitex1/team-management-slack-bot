import { Role } from "../entities/Role";
import { AppDataSource } from "../entities/dataSource";
import { RoleServiceType } from "../types/RoleService";

export const RoleService = (): RoleServiceType => {
  const createRole = async (title: string) => {
    const roleRepository = AppDataSource.getRepository(Role);
    const role = new Role();
    role.title = title;
    return await roleRepository.save(role);
  };

  const readAll = async () => {
    const roleRepository = AppDataSource.getRepository(Role);
    const roles = await roleRepository.find();
    return roles;
  };

  const isValidRole = async (title: string) => {
    const roleRepository = AppDataSource.getRepository(Role);
    const role = await roleRepository
      .createQueryBuilder()
      .select("*")
      .where(`LOWER(title) = '${title.toLowerCase()}'`)
      .getRawOne();
    return !!role;
  };

  return { createRole, readAll, isValidRole };
};
