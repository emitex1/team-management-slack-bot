import { AppDataSource } from "../entities/dataSource";
import { Candidate } from "../entities/Candidate";
import { Supervisor } from "../entities/Supervisor";
import { Role } from "../entities/Role";
import { initCandidates } from "../fixture/init_candidates";
import { initRoles } from "../fixture/init_roles";

export const GeneralServices = {
  clearAll: async () => {
    const roleRepo = AppDataSource.getRepository(Role);
    roleRepo.delete({});

    const supervisorRepo = AppDataSource.getRepository(Supervisor);
    supervisorRepo.clear();
    // supervisorRepo.delete({});

    const candidateRepo = AppDataSource.getRepository(Candidate);
    candidateRepo.delete({});
    // await candidateRepo.query(`TRUNCATE candidate RESTART IDENTITY CASCADE;`);

    return true;
  },

  initializeRoles: async () => {
    const roleRepo = AppDataSource.getRepository(Role);

    initRoles.forEach(async (role) => {
      let rolePayload = new Role();
      rolePayload.title = role.title;
      roleRepo.save(rolePayload);
      // const savedRole = await AppDataSource.manager.save(rolePayload);
    });

    return true;
  },

  initializeCandidates: async () => {
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
        candidate.supervisors !== undefined &&
        candidate.supervisors.length > 0
      ) {
        let candidateRole = await roleRepo.findOne({
          where: { title: candidate.supervisors[0].role.title },
        });
        if (candidateRole === null) {
          candidateRole = await roleRepo.save({
            title: candidate.supervisors[0].role.title,
            creationDate: new Date(candidate.supervisors[0].creationDate),
          });
        }

        let newSupervisor = new Supervisor();
        newSupervisor.candidate = savedCandidate;
        newSupervisor.role = candidateRole;
        newSupervisor.creationDate = new Date(
          candidate.supervisors[0].creationDate
        ).getTime();
        await AppDataSource.manager.save(newSupervisor);
      }
    });

    return true;
  },
};
