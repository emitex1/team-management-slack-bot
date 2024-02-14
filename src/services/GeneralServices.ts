import { AppDataSource } from "../entities/dataSource";
import { Candidate } from "../entities/Candidate";
import { Responsible } from "../entities/Responsible";
import { Role } from "../entities/Role";
import { GeneralServiceType } from "../types/GeneralServiceType";
import { initCandidates } from "../fixture/init_candidates";
import { initRoles } from "../fixture/init_roles";

export const GeneralServices = (): GeneralServiceType => {
  const clearAll = async () => {
    const roleRepo = AppDataSource.getRepository(Role);
    roleRepo.delete({});

    const responsibleRepo = AppDataSource.getRepository(Responsible);
    responsibleRepo.clear();
    // responsibleRepo.delete({});

    const candidateRepo = AppDataSource.getRepository(Candidate);
    candidateRepo.delete({});
    // await candidateRepo.query(`TRUNCATE candidate RESTART IDENTITY CASCADE;`);

    return true;
  };

  const initializeRoles = async () => {
    const roleRepo = AppDataSource.getRepository(Role);

    initRoles.forEach(async (role) => {
      let rolePayload = new Role();
      rolePayload.title = role.title;
      roleRepo.save(rolePayload);
      // const savedRole = await AppDataSource.manager.save(rolePayload);
    });

    return true;
  };

  const initializeCandidates = async () => {
    const roleRepo = AppDataSource.getRepository(Role);

    initCandidates.forEach(async (candidate) => {
      let candidatePayload = new Candidate();
      candidatePayload.name = candidate.name;
      candidatePayload.lastName = candidate.lastName;
      candidatePayload.title = candidate.title;
      if (candidate.isActive !== undefined)
        candidatePayload.isActive = candidate.isActive;

      const savedCandidate = await AppDataSource.manager.save(candidatePayload);

      if (
        candidate.responsibles !== undefined &&
        candidate.responsibles.length > 0
      ) {
        let candidateRole = await roleRepo.findOne({
          where: { title: candidate.responsibles[0].role.title },
        });
        if (candidateRole === null) {
          candidateRole = await roleRepo.save({
            title: candidate.responsibles[0].role.title,
            creationDate: new Date(candidate.responsibles[0].creationDate),
          });
        }

        let newResponsible = new Responsible();
        newResponsible.candidate = savedCandidate;
        newResponsible.role = candidateRole;
        newResponsible.creationDate = new Date(
          candidate.responsibles[0].creationDate
        ).getTime();
        await AppDataSource.manager.save(newResponsible);
      }
    });

    return true;
  };

  return {
    clearAll,
    initializeCandidates,
    initializeRoles,
  };
};
