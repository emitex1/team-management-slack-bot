import { AppDataSource } from "../entities/dataSource";
import { Teammate } from "../entities/Teammate";
import { Supervisor } from "../entities/Supervisor";
import { Role } from "../entities/Role";
import { initTeammates } from "../fixture/init_teammates";
import { initRoles } from "../fixture/init_roles";

export const GeneralServices = {
  clearAll: async () => {
    const roleRepo = AppDataSource.getRepository(Role);
    roleRepo.delete({});

    const supervisorRepo = AppDataSource.getRepository(Supervisor);
    supervisorRepo.clear();
    // supervisorRepo.delete({});

    const teammateRepo = AppDataSource.getRepository(Teammate);
    teammateRepo.delete({});
    // await teammateRepo.query(`TRUNCATE teammate RESTART IDENTITY CASCADE;`);

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

  initializeTeammates: async () => {
    const roleRepo = AppDataSource.getRepository(Role);

    initTeammates.forEach(async (teammate) => {
      //TODO: use teammate service to save the data in db
      let teammatePayload = new Teammate();
      teammatePayload.firstName = teammate.name;
      teammatePayload.lastName = teammate.lastName;
      teammatePayload.title = teammate.title;
      teammatePayload.displayName = teammate.displayName;
      teammatePayload.slackMemberId = teammate.slackMemberId;
      teammatePayload.avatarUrl = teammate.avatarUrl;
      if (teammate.isActive !== undefined)
        teammatePayload.isActive = teammate.isActive;

      const savedTeammate = await AppDataSource.manager.save(teammatePayload);

      if (
        teammate.supervisors !== undefined &&
        teammate.supervisors.length > 0
      ) {
        let teammateRole = await roleRepo.findOne({
          where: { title: teammate.supervisors[0].role.title },
        });
        if (teammateRole === null) {
          teammateRole = await roleRepo.save({
            title: teammate.supervisors[0].role.title,
            creationDate: new Date(teammate.supervisors[0].creationDate),
          });
        }

        let newSupervisor = new Supervisor();
        newSupervisor.teammate = savedTeammate;
        newSupervisor.role = teammateRole;
        newSupervisor.creationDate = new Date(
          teammate.supervisors[0].creationDate
        ).getTime();
        await AppDataSource.manager.save(newSupervisor);
      }
    });

    return true;
  },
};
