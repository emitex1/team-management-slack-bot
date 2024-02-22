import { AppDataSource } from "../entities/dataSource";
import { Teammate } from "../entities/Teammate";

export const TeammateService = {
  readAllTeammates: async () => {
    const teammates = await AppDataSource.manager.find(Teammate);

    return teammates;
  },

  searchTeammates: async (searchTerm?: string, isActive?: boolean) => {
    const teammatesRepository = AppDataSource.getRepository(Teammate);
    const teammates = teammatesRepository.createQueryBuilder("teammate");

    if (isActive !== undefined) {
      teammates.andWhere("isActive = :isActive", { isActive });
    }

    if (searchTerm) {
      teammates.andWhere("LOWER(teammate.firstName) LIKE LOWER(:searchTerm)", {
        searchTerm: `%${searchTerm}%`,
      });
    }

    return await teammates.getMany();
  },

  readActiveTeammates: async () => {
    const teammatesRepository = AppDataSource.getRepository(Teammate);
    const activeTeammates = await teammatesRepository.find({
      where: { isActive: true },
    });
    return activeTeammates;
  },

  readTeammateById: async (id: string) => {
    const teammatesRepository = AppDataSource.getRepository(Teammate);
    const teammate = await teammatesRepository.findOneBy({ id });
    return teammate;
  },

  readTeammateByFirstName: async (firstName: string) => {
    const teammatesRepository = AppDataSource.getRepository(Teammate);

    const teammate = await teammatesRepository
      .createQueryBuilder("teammate")
      .where("LOWER(teammate.firstName) = LOWER(:firstName)", { firstName })
      .andWhere("teammate.isActive = true")
      .getOne();
    return teammate;
  },

  addTeammate: async (
    title: string,
    firstName: string,
    lastName: string,
    slackMemberId: string,
    displayName: string,
    avatarUrl: string
  ) => {
    if (!firstName || !firstName.trim())
      return Promise.reject("Teammate name is required");

    const teammate = new Teammate();
    teammate.firstName = firstName;
    teammate.title = title;
    teammate.lastName = lastName;
    teammate.displayName = displayName;
    teammate.slackMemberId = slackMemberId;
    teammate.avatarUrl = avatarUrl;

    const teammatesRepository = AppDataSource.getRepository(Teammate);
    const savedTeammate = await teammatesRepository.save(teammate);
    // commit the transaction before returning the result
    return savedTeammate;
  },

  deactivateTeammate: async (teammate: Teammate) => {
    const teammatesRepository = AppDataSource.getRepository(Teammate);
    teammate.isActive = false;
    teammate.editionDate = Date.now() / 1;
    const savedTeammate = await teammatesRepository.save(teammate);

    return savedTeammate;
  },

  updateTeammate: async (teammate: Teammate) => {
    const teammatesRepository = AppDataSource.getRepository(Teammate);
    teammate.editionDate = Date.now() / 1;
    const updateResult = await teammatesRepository.update(
      teammate.id,
      teammate
    );
    return updateResult;
  },
};
