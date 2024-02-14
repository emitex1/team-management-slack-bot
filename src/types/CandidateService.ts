import { UpdateResult } from "typeorm";
import { Candidate } from "../entities/Candidate";

export type CandidateServiceType = {
  readAllCandidates: () => Promise<Candidate[]>;

  searchCandidates: (
    searchTerm?: string,
    isActive?: boolean
  ) => Promise<Candidate[]>;

  readActiveCandidates: () => Promise<Candidate[]>;

  readCandidateById: (id: string) => Promise<Candidate | null>;

  readCandidateByName: (name: string) => Promise<Candidate | null>;

  addCandidate: (
    name: string,
    title?: string,
    lastName?: string,
    userName?: string
  ) => Promise<Candidate>;

  deactivateCandidate: (candidate: Candidate) => Promise<Candidate>;

  updateCandidate: (candidate: Candidate) => Promise<UpdateResult>;
};
