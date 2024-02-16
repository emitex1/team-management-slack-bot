import { AppDataSource } from "../entities/dataSource";
import { Candidate } from "../entities/Candidate";
import { Responsible } from "../entities/Responsible";
import { Role } from "../entities/Role";
import { elog } from "../util/logHelper";
import { RoleService } from "./RoleService";
import { CandidateService } from "./CandidateService";

export const ResponsibleService = {
  getLastResponsible: async (roleName: string) => {
    const role = await RoleService.getRoleByName(roleName);
    if (!role) {
      throw new Error(`Role with name ${roleName} not found`);
    }

    const responsibleRepository = AppDataSource.getRepository(Responsible);
    const lastResponsible = await responsibleRepository
      .createQueryBuilder()
      .select("*")
      .where({ role: role })
      .orderBy("creationDate", "DESC")
      .getRawOne();
    elog("lastResponsible", lastResponsible);

    return lastResponsible;
  },

  getLastResponsibles: async (roleName: string, limitation?: number) => {
    const role = await RoleService.getRoleByName(roleName);
    if (!role) {
      throw new Error(`Role with name ${roleName} not found`);
    }

    const responsibleRepository = AppDataSource.getRepository(Responsible);
    const lastThreeResponsibles = await responsibleRepository
      .createQueryBuilder("responsible")
      .leftJoinAndSelect("responsible.candidate", "candidate")
      .leftJoinAndSelect("responsible.role", "role")
      .where({ role: role })
      .orderBy("responsible.creationDate", "DESC")
      .limit(limitation)
      .getMany();

    return lastThreeResponsibles;
  },

  getCandidateResponsiblities: async (
    candidateId: string,
    roleName: string
  ) => {
    const role = await RoleService.getRoleByName(roleName);
    if (!role) {
      throw new Error(`Role with name ${roleName} not found`);
    }

    const responsibleRepository = AppDataSource.getRepository(Responsible);
    const candidateResponsiblities = await responsibleRepository
      .createQueryBuilder("responsible")
      .leftJoinAndSelect("responsible.candidate", "candidate")
      .leftJoinAndSelect("responsible.role", "role")
      .where({ role: role })
      .andWhere({ candidate: { id: candidateId } })
      .orderBy("responsible.creationDate", "DESC")
      .getMany();

    return candidateResponsiblities;
  },

  addResponsibleIfExists: async (candidateName: string, roleName: string) => {
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

    const responsible = new Responsible();
    responsible.candidate = candidate;
    responsible.role = role;

    const responsibleRepository = AppDataSource.getRepository(Responsible);
    const savedResponsible = await responsibleRepository.save(responsible);
    return savedResponsible;
  },

  addResponsible: async (candidateId: string) => {
    const candidate = await CandidateService.readCandidateById(candidateId);
    if (!candidate) {
      throw new Error(`Candidate with id ${candidateId} not found`);
    }

    const responsible = new Responsible();
    responsible.candidate = candidate;

    const responsibleRepository = AppDataSource.getRepository(Responsible);
    const savedResponsible = await responsibleRepository.save(responsible);
    return savedResponsible;
  },

  readAll: async () => {
    const responsibleRepository = AppDataSource.getRepository(Responsible);
    const responsibles = await responsibleRepository.find({
      relations: { candidate: true, role: true },
    });
    return responsibles;
  },
};
