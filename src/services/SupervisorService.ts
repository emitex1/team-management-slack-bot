import { AppDataSource } from "../entities/dataSource";
import { Teammate } from "../entities/Teammate";
import { Supervisor } from "../entities/Supervisor";
import { Role } from "../entities/Role";
import { elog } from "../util/logHelper";
import { RoleService } from "./RoleService";
import { TeammateService } from "./TeammateService";

export const SupervisorService = {
  getLastSupervisor: async (roleName: string) => {
    const role = await RoleService.getRoleByName(roleName);
    if (!role) {
      throw new Error(`Role with name ${roleName} not found`);
    }

    const supervisorRepository = AppDataSource.getRepository(Supervisor);
    const lastSupervisor = await supervisorRepository
      .createQueryBuilder()
      .select("*")
      .where({ role: role })
      .orderBy("creationDate", "DESC")
      .getRawOne();
    elog("lastSupervisor", lastSupervisor);

    return lastSupervisor;
  },

  getLastSupervisors: async (roleName: string, limitation?: number) => {
    const role = await RoleService.getRoleByName(roleName);
    if (!role) {
      throw new Error(`Role with name ${roleName} not found`);
    }

    const supervisorRepository = AppDataSource.getRepository(Supervisor);
    const lastThreeSupervisors = await supervisorRepository
      .createQueryBuilder("supervisor")
      .leftJoinAndSelect("supervisor.teammate", "teammate")
      .leftJoinAndSelect("supervisor.role", "role")
      .where({ role: role })
      .orderBy("supervisor.creationDate", "DESC")
      .limit(limitation)
      .getMany();

    return lastThreeSupervisors;
  },

  getTeammateSupervisors: async (teammateId: string, roleName: string) => {
    const role = await RoleService.getRoleByName(roleName);
    if (!role) {
      throw new Error(`Role with name ${roleName} not found`);
    }

    const supervisorRepository = AppDataSource.getRepository(Supervisor);
    const teammateSupervisors = await supervisorRepository
      .createQueryBuilder("supervisor")
      .leftJoinAndSelect("supervisor.teammate", "teammate")
      .leftJoinAndSelect("supervisor.role", "role")
      .where({ role: role })
      .andWhere({ teammate: { id: teammateId } })
      .orderBy("supervisor.creationDate", "DESC")
      .getMany();

    return teammateSupervisors;
  },

  addSupervisorIfExists: async (teammateName: string, roleName: string) => {
    const teammatesRepository = AppDataSource.getRepository(Teammate);
    const teammate = await teammatesRepository.findOneBy({
      name: teammateName,
    });

    if (!teammate) {
      throw new Error(`Teammate with name "${teammateName}" not found`);
    }

    const role = await RoleService.getRoleByName(roleName);
    if (!role) {
      throw new Error(`Role with name ${roleName} not found`);
    }

    const supervisor = new Supervisor();
    supervisor.teammate = teammate;
    supervisor.role = role;

    const supervisorRepository = AppDataSource.getRepository(Supervisor);
    const savedSupervisor = await supervisorRepository.save(supervisor);
    return savedSupervisor;
  },

  addSupervisor: async (teammateId: string) => {
    const teammate = await TeammateService.readTeammateById(teammateId);
    if (!teammate) {
      throw new Error(`Teammate with id ${teammateId} not found`);
    }

    const supervisor = new Supervisor();
    supervisor.teammate = teammate;

    const supervisorRepository = AppDataSource.getRepository(Supervisor);
    const savedSupervisor = await supervisorRepository.save(supervisor);
    return savedSupervisor;
  },

  readAll: async () => {
    const supervisorRepository = AppDataSource.getRepository(Supervisor);
    const supervisors = await supervisorRepository.find({
      relations: { teammate: true, role: true },
    });
    return supervisors;
  },
};
