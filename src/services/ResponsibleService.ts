import { AppDataSource } from "../entities/dataSource";
import { Candidate } from "../entities/Candidate";
import { ResponsibleServiceType } from "../types/ResponsibleService";
import { Responsible } from "../entities/Responsible";
import { Role } from "../entities/Role";

export const ResponsibleService = (): ResponsibleServiceType => {
  const getLastResponsible = async (roleName: string) => {
    const roleRepository = AppDataSource.getRepository(Role);
    const role = await roleRepository
      .createQueryBuilder()
      .select("*")
      .where(`LOWER(title) = '${roleName.toLowerCase()}'`)
      .getRawOne();

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
    console.log("lastResponsible", lastResponsible);

    return lastResponsible;
  };

  const getLastThreeResponsible = async (
    roleName: string,
    limitation?: number
  ) => {
    const roleRepository = AppDataSource.getRepository(Role);
    const role = await roleRepository
      .createQueryBuilder()
      .select("*")
      .where(`LOWER(title) = '${roleName.toLowerCase()}'`)
      .getRawOne();

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
  };

  const getCandidateResponsiblities = async (
    candidateId: string,
    roleName: string
  ) => {
    const roleRepository = AppDataSource.getRepository(Role);
    const role = await roleRepository
      .createQueryBuilder()
      .select("*")
      .where(`LOWER(title) = '${roleName.toLowerCase()}'`)
      .getRawOne();

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
  };

  const addResponsibleIfExists = async (
    candidateName: string,
    roleName: string
  ) => {
    const candidatesRepository = AppDataSource.getRepository(Candidate);
    const candidate = await candidatesRepository.findOneBy({
      name: candidateName,
    });

    if (!candidate) {
      throw new Error(`Candidate with name "${candidateName}" not found`);
    }

    const roleRepository = AppDataSource.getRepository(Role);
    const role = await roleRepository
      .createQueryBuilder()
      .select("*")
      .where(`LOWER(title) = '${roleName.toLowerCase()}'`)
      .getRawOne();

    if (!role) {
      throw new Error(`Role with name ${roleName} not found`);
    }

    const responsible = new Responsible();
    responsible.candidate = candidate;
    responsible.role = role;

    const responsibleRepository = AppDataSource.getRepository(Responsible);
    const savedResponsible = await responsibleRepository.save(responsible);
    return savedResponsible;
  };

  const addResponsible = async (candidateId: string) => {
    const candidatesRepository = AppDataSource.getRepository(Candidate);
    const candidate = await candidatesRepository.findOneBy({
      id: candidateId,
    });

    if (!candidate) {
      throw new Error(`Candidate with id ${candidateId} not found`);
    }

    const responsible = new Responsible();
    responsible.candidate = candidate;

    const responsibleRepository = AppDataSource.getRepository(Responsible);
    const savedResponsible = await responsibleRepository.save(responsible);
    return savedResponsible;
  };

  const readAll = async () => {
    const responsibleRepository = AppDataSource.getRepository(Responsible);
    const responsibles = await responsibleRepository.find({
      relations: { candidate: true, role: true },
    });
    return responsibles;
  };

  return {
    getLastResponsible,
    getLastThreeResponsible,
    getCandidateResponsiblities,
    addResponsible,
    addResponsibleIfExists,
    readAll,
  };
};
