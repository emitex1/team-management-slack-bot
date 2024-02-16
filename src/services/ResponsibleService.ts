import { AppDataSource } from "../entities/dataSource";
import { Candidate } from "../entities/Candidate";
import { Supervisor } from "../entities/Supervisor";
import { Role } from "../entities/Role";
import { elog } from "../util/logHelper";
import { RoleService } from "./RoleService";
import { CandidateService } from "./CandidateService";

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
      .leftJoinAndSelect("supervisor.candidate", "candidate")
      .leftJoinAndSelect("supervisor.role", "role")
      .where({ role: role })
      .orderBy("supervisor.creationDate", "DESC")
      .limit(limitation)
      .getMany();

    return lastThreeSupervisors;
  },

  getCandidateSupervisors: async (candidateId: string, roleName: string) => {
    const role = await RoleService.getRoleByName(roleName);
    if (!role) {
      throw new Error(`Role with name ${roleName} not found`);
    }

    const supervisorRepository = AppDataSource.getRepository(Supervisor);
    const candidateSupervisors = await supervisorRepository
      .createQueryBuilder("supervisor")
      .leftJoinAndSelect("supervisor.candidate", "candidate")
      .leftJoinAndSelect("supervisor.role", "role")
      .where({ role: role })
      .andWhere({ candidate: { id: candidateId } })
      .orderBy("supervisor.creationDate", "DESC")
      .getMany();

    return candidateSupervisors;
  },

  addSupervisorIfExists: async (candidateName: string, roleName: string) => {
    const candidatesRepository = AppDataSource.getRepository(Candidate);
    const candidate = await candidatesRepository.findOneBy({
      name: candidateName,
    });

    if (!candidate) {
      throw new Error(`Candidate with name "${candidateName}" not found`);
    }

    const role = await RoleService.getRoleByName(roleName);
    if (!role) {
      throw new Error(`Role with name ${roleName} not found`);
    }

    const supervisor = new Supervisor();
    supervisor.candidate = candidate;
    supervisor.role = role;

    const supervisorRepository = AppDataSource.getRepository(Supervisor);
    const savedSupervisor = await supervisorRepository.save(supervisor);
    return savedSupervisor;
  },

  addSupervisor: async (candidateId: string) => {
    const candidate = await CandidateService.readCandidateById(candidateId);
    if (!candidate) {
      throw new Error(`Candidate with id ${candidateId} not found`);
    }

    const supervisor = new Supervisor();
    supervisor.candidate = candidate;

    const supervisorRepository = AppDataSource.getRepository(Supervisor);
    const savedSupervisor = await supervisorRepository.save(supervisor);
    return savedSupervisor;
  },

  readAll: async () => {
    const supervisorRepository = AppDataSource.getRepository(Supervisor);
    const supervisors = await supervisorRepository.find({
      relations: { candidate: true, role: true },
    });
    return supervisors;
  },
};
