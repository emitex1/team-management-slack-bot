import { AppDataSource } from "../entities/dataSource";
import { Candidate } from "../entities/Candidate";

export const CandidateService = {
  readAllCandidates: async () => {
    const candidates = await AppDataSource.manager.find(Candidate);

    return candidates;
  },

  searchCandidates: async (searchTerm?: string, isActive?: boolean) => {
    const candidatesRepository = AppDataSource.getRepository(Candidate);
    const candidates = candidatesRepository.createQueryBuilder("candidate");

    if (isActive !== undefined) {
      candidates.andWhere("isActive = :isActive", { isActive });
    }

    if (searchTerm) {
      candidates.andWhere("LOWER(candidate.name) LIKE LOWER(:searchTerm)", {
        searchTerm: `%${searchTerm}%`,
      });
    }

    return await candidates.getMany();
  },

  readActiveCandidates: async () => {
    const candidatesRepository = AppDataSource.getRepository(Candidate);
    const activeCandidates = await candidatesRepository.find({
      where: { isActive: true },
    });
    return activeCandidates;
  },

  readCandidateById: async (id: string) => {
    const candidatesRepository = AppDataSource.getRepository(Candidate);
    const candidate = await candidatesRepository.findOneBy({ id });
    return candidate;
  },

  readCandidateByName: async (name: string) => {
    const candidatesRepository = AppDataSource.getRepository(Candidate);

    const candidate = await candidatesRepository
      .createQueryBuilder("candidate")
      .where("LOWER(candidate.name) = LOWER(:name)", { name })
      .andWhere("candidate.isActive = true")
      .getOne();
    return candidate;
  },

  addCandidate: async (
    name: string,
    title?: string,
    lastName?: string,
    userName?: string
  ) => {
    if (!name || !name.trim())
      return Promise.reject("Candidate name is required");

    const candidate = new Candidate();
    candidate.name = name;
    candidate.title = title;
    candidate.lastName = lastName;
    candidate.userName = userName;

    const candidatesRepository = AppDataSource.getRepository(Candidate);
    const savedCandidate = await candidatesRepository.save(candidate);
    // commit the transaction before returning the result
    return savedCandidate;
  },

  deactivateCandidate: async (candidate: Candidate) => {
    const candidatesRepository = AppDataSource.getRepository(Candidate);
    candidate.isActive = false;
    candidate.editionDate = Date.now() / 1;
    const savedCandidate = await candidatesRepository.save(candidate);

    return savedCandidate;
  },

  updateCandidate: async (candidate: Candidate) => {
    const candidatesRepository = AppDataSource.getRepository(Candidate);
    candidate.editionDate = Date.now() / 1;
    const updateResult = await candidatesRepository.update(
      candidate.id,
      candidate
    );
    return updateResult;
  },
};
