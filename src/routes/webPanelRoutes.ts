import express, { Request, Response } from "express";
import { ConfigType } from "../configs";
import { CandidateServiceType } from "../types/CandidateService";
import { ResponsibleServiceType } from "../types/ResponsibleService";
import { ErrorType } from "../types/Other";
import { createOutput } from "../util/apiHelpers";
import { sendToLogChannel } from "../services/slackServices";
import { logsConstants } from "../constants/logs";
import { RoleServiceType } from "../types/RoleService";

export const webPanelRouter = (
  configs: ConfigType,
  candidateService: CandidateServiceType,
  responsibleService: ResponsibleServiceType,
  roleService: RoleServiceType
) => {
  const router = express.Router();

  router.get("/candidates", async (_req: Request, res: Response) => {
    try {
      const isActive =
        _req.query.isActive === "true"
          ? true
          : _req.query.isActive === "false"
          ? false
          : undefined;
      const searchTerm: string = _req.query.search?.toString() || "";
      const candidates = await candidateService.searchCandidates(
        searchTerm,
        isActive
      );

      res.json(createOutput(candidates));
    } catch (error) {
      const errorMessage = (error as ErrorType).message;
      res.status(500).json(createOutput(null, errorMessage));
    }
  });

  router.get(
    "/candidate/:candidate_id",
    async (req: Request, res: Response) => {
      try {
        const candidateId = req.params.candidate_id;
        if (!candidateId) {
          res.status(400).json(createOutput(null, "Candidate ID is required"));
        }

        const candidate = await candidateService.readCandidateById(candidateId);
        if (candidate) res.json(createOutput(candidate));
        else res.status(404).json(createOutput(null, "Candidate not found"));
      } catch (error) {
        const errorMessage = (error as ErrorType).message;
        res.status(500).json(createOutput(null, errorMessage));
      }
    }
  );

  const validateCandidatePayload = (
    body: any,
    checkRequired: boolean = true
  ): string | undefined => {
    const { name } = body;
    if (checkRequired && !name) {
      return "Candidate name is required";
    }
  };

  router.put(
    "/candidate/:candidate_id",
    async (req: Request, res: Response) => {
      try {
        const candidateId = req.params.candidate_id;
        if (!candidateId) {
          res.status(400).json(createOutput(null, "Candidate ID is required"));
        }

        const validationError = validateCandidatePayload(req.body, false);
        if (validationError)
          res.status(400).json(createOutput(null, validationError));

        const candidate = await candidateService.readCandidateById(candidateId);
        if (!candidate) {
          res.status(404).json(createOutput(null, "Candidate not found"));
        }

        const editedCandidate = { ...candidate, ...req.body };

        const result = await candidateService.updateCandidate(editedCandidate);
        if (result) {
          res.json(
            createOutput(editedCandidate, "Candidate updated successfully")
          );
          sendToLogChannel(logsConstants.updateCandidate(candidate?.name!));
        } else res.status(500).json(createOutput(null, "Update failed"));
      } catch (error) {
        console.error(error);
        const errorMessage = (error as ErrorType).message;
        res.status(500).json(createOutput(null, errorMessage));
      }
    }
  );

  router.put(
    "/candidate/:candidate_id/deactivate",
    async (req: Request, res: Response) => {
      try {
        const candidateId = req.params.candidate_id;
        if (!candidateId) {
          res.status(400).json(createOutput(null, "Candidate ID is required"));
        }

        const candidate = await candidateService.readCandidateById(candidateId);
        if (!candidate) {
          res.status(404).json(createOutput(null, "Candidate not found"));
        }

        const deactiveCandidate = await candidateService.deactivateCandidate(
          candidate!
        );
        if (deactiveCandidate) {
          res.json(
            createOutput(candidate, "Candidate deactivated successfully")
          );
          sendToLogChannel(logsConstants.deactivateCandidate(candidate?.name!));
        } else res.status(500).json(createOutput(null, "Deactivation failed"));
      } catch (error) {
        const errorMessage = (error as ErrorType).message;
        res.status(500).json(createOutput(null, errorMessage));
      }
    }
  );

  router.post("/candidates", async (req: Request, res: Response) => {
    try {
      const validationError = validateCandidatePayload(req.body);
      if (validationError)
        res.status(400).json(createOutput(null, validationError));

      const candidate = await candidateService.addCandidate(
        req.body.name,
        req.body.title,
        req.body.lastName,
        req.body.userName
      );
      res.json(createOutput(candidate));
      sendToLogChannel(logsConstants.addNewUser(candidate?.name!, true));
    } catch (error) {
      const errorMessage = (error as ErrorType).message;
      res.status(500).json(createOutput(null, errorMessage));
    }
  });

  router.get("/roles/:role_name", async (req: Request, res: Response) => {
    try {
      const isRoleExists = await roleService.isValidRole(req.params.role_name);
      if (!isRoleExists) {
        return res.status(404).json(createOutput(null, "Role not found"));
      }

      const responsibles = await responsibleService.getLastThreeResponsible(
        req.params.role_name
      );
      res.json(createOutput(responsibles));
    } catch (error) {
      const errorMessage = (error as ErrorType).message;
      res.status(500).json(createOutput(null, errorMessage));
    }
  });

  router.get(
    "/roles/:role_name/:candidate_id",
    async (req: Request, res: Response) => {
      try {
        const isRoleExists = await roleService.isValidRole(
          req.params.role_name
        );
        if (!isRoleExists) {
          return res.status(404).json(createOutput(null, "Role not found"));
        }

        const candidateId = req.params.candidate_id;
        if (!candidateId) {
          res.status(400).json(createOutput(null, "Candidate ID is required"));
        }

        const candidate = await candidateService.readCandidateById(candidateId);
        if (!candidate) {
          res.status(404).json(createOutput(null, "Candidate not found"));
        }

        const candidateResponsiblities =
          await responsibleService.getCandidateResponsiblities(
            candidateId,
            req.params.role_name
          );
        res.json(createOutput(candidateResponsiblities));
      } catch (error) {
        const errorMessage = (error as ErrorType).message;
        res.status(500).json(createOutput(null, errorMessage));
      }
    }
  );

  return router;
};
