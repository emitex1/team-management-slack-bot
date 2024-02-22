import express, { Request, Response } from "express";
import { ConfigType } from "../configs";
import { ErrorType } from "../types/Other";
import { createOutput } from "../util/apiHelpers";
import { sendToLogChannel } from "../services/slackServices";
import { logsConstants } from "../constants/logs";
import { TeammateService } from "../services/TeammateService";
import { RoleService } from "../services/RoleService";
import { SupervisorService } from "../services/SupervisorService";

export const webPanelRouter = (configs: ConfigType) => {
  const router = express.Router();

  router.get("/teammates", async (_req: Request, res: Response) => {
    try {
      const isActive =
        _req.query.isActive === "true"
          ? true
          : _req.query.isActive === "false"
          ? false
          : undefined;
      const searchTerm: string = _req.query.search?.toString() || "";
      const teammates = await TeammateService.searchTeammates(
        searchTerm,
        isActive
      );

      res.json(createOutput(teammates));
    } catch (error) {
      const errorMessage = (error as ErrorType).message;
      res.status(500).json(createOutput(null, errorMessage));
    }
  });

  router.get("/teammate/:teammate_id", async (req: Request, res: Response) => {
    try {
      const teammateId = req.params.teammate_id;
      if (!teammateId) {
        res.status(400).json(createOutput(null, "Teammate ID is required"));
      }

      const teammate = await TeammateService.readTeammateById(teammateId);
      if (teammate) res.json(createOutput(teammate));
      else res.status(404).json(createOutput(null, "Teammate not found"));
    } catch (error) {
      const errorMessage = (error as ErrorType).message;
      res.status(500).json(createOutput(null, errorMessage));
    }
  });

  const validateTeammatePayload = (
    body: any,
    checkRequired: boolean = true
  ): string | undefined => {
    const { name } = body;
    if (checkRequired && !name) {
      return "Teammate name is required";
    }
  };

  router.put("/teammate/:teammate_id", async (req: Request, res: Response) => {
    try {
      const teammateId = req.params.teammate_id;
      if (!teammateId) {
        res.status(400).json(createOutput(null, "Teammate ID is required"));
      }

      const validationError = validateTeammatePayload(req.body, false);
      if (validationError)
        res.status(400).json(createOutput(null, validationError));

      const teammate = await TeammateService.readTeammateById(teammateId);
      if (!teammate) {
        res.status(404).json(createOutput(null, "Teammate not found"));
      }

      const editedTeammate = { ...teammate, ...req.body };

      const result = await TeammateService.updateTeammate(editedTeammate);
      if (result) {
        res.json(createOutput(editedTeammate, "Teammate updated successfully"));
        sendToLogChannel(logsConstants.updateTeammate(teammate?.firstName!));
      } else res.status(500).json(createOutput(null, "Update failed"));
    } catch (error) {
      console.error(error);
      const errorMessage = (error as ErrorType).message;
      res.status(500).json(createOutput(null, errorMessage));
    }
  });

  router.put(
    "/teammate/:teammate_id/deactivate",
    async (req: Request, res: Response) => {
      try {
        const teammateId = req.params.teammate_id;
        if (!teammateId) {
          res.status(400).json(createOutput(null, "Teammate ID is required"));
        }

        const teammate = await TeammateService.readTeammateById(teammateId);
        if (!teammate) {
          res.status(404).json(createOutput(null, "Teammate not found"));
        }

        const deactiveTeammate = await TeammateService.deactivateTeammate(
          teammate!
        );
        if (deactiveTeammate) {
          res.json(createOutput(teammate, "Teammate deactivated successfully"));
          sendToLogChannel(
            logsConstants.deactivateTeammate(teammate?.firstName!)
          );
        } else res.status(500).json(createOutput(null, "Deactivation failed"));
      } catch (error) {
        const errorMessage = (error as ErrorType).message;
        res.status(500).json(createOutput(null, errorMessage));
      }
    }
  );

  router.post("/teammates", async (req: Request, res: Response) => {
    try {
      const validationError = validateTeammatePayload(req.body);
      if (validationError)
        res.status(400).json(createOutput(null, validationError));

      const teammate = await TeammateService.addTeammate(
        req.body.title,
        req.body.firstName,
        req.body.lastName,
        req.body.slackMemberId,
        req.body.displayName,
        req.body.avatarUrl
      );
      res.json(createOutput(teammate));
      sendToLogChannel(logsConstants.addNewUser(teammate?.firstName!, true));
    } catch (error) {
      const errorMessage = (error as ErrorType).message;
      res.status(500).json(createOutput(null, errorMessage));
    }
  });

  router.get("/roles/:role_name", async (req: Request, res: Response) => {
    try {
      const isRoleExists = await RoleService.isValidRole(req.params.role_name);
      if (!isRoleExists) {
        return res.status(404).json(createOutput(null, "Role not found"));
      }

      const supervisors = await SupervisorService.getLastSupervisors(
        req.params.role_name
      );
      res.json(createOutput(supervisors));
    } catch (error) {
      const errorMessage = (error as ErrorType).message;
      res.status(500).json(createOutput(null, errorMessage));
    }
  });

  router.get(
    "/roles/:role_name/:teammate_id",
    async (req: Request, res: Response) => {
      try {
        const isRoleExists = await RoleService.isValidRole(
          req.params.role_name
        );
        if (!isRoleExists) {
          return res.status(404).json(createOutput(null, "Role not found"));
        }

        const teammateId = req.params.teammate_id;
        if (!teammateId) {
          res.status(400).json(createOutput(null, "Teammate ID is required"));
        }

        const teammate = await TeammateService.readTeammateById(teammateId);
        if (!teammate) {
          res.status(404).json(createOutput(null, "Teammate not found"));
        }

        const teammateSupervisors =
          await SupervisorService.getTeammateSupervisors(
            teammateId,
            req.params.role_name
          );
        res.json(createOutput(teammateSupervisors));
      } catch (error) {
        const errorMessage = (error as ErrorType).message;
        res.status(500).json(createOutput(null, errorMessage));
      }
    }
  );

  return router;
};
