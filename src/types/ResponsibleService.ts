import { Responsible } from "../entities/Responsible";

export type ResponsibleServiceType = {
  getLastResponsible: (role: string) => Promise<Responsible>;
  getLastThreeResponsible: (
    role: string,
    limitation?: number
  ) => Promise<Responsible[]>;
  getCandidateResponsiblities(
    candidateId: string,
    role: string
  ): Promise<Responsible[]>;
  addResponsible: (candidateId: string) => Promise<Responsible>;
  addResponsibleIfExists: (
    candidateName: string,
    role: string
  ) => Promise<Responsible>;
  readAll: () => Promise<Responsible[]>;
};
