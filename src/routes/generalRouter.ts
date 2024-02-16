import express, { Request, Response } from "express";
import { getFormattedDate } from "../util/dateHelpers";
import { GeneralServices } from "../services/GeneralServices";

export const generalRouter = () => {
  const router = express.Router();

  // Version api
  router.get("/version", (_req: Request, res: Response) => {
    const currentVersion = require("../../package.json").version;
    res.send("v." + currentVersion.toString());
  });

  router.get("/clear", async (_req: Request, res: Response) => {
    const result = await GeneralServices.clearAll();
    if (result === true) {
      res.send(
        "All of the current data are removed at (" +
          getFormattedDate(new Date()) +
          ")"
      );
    } else {
      res.send("Error in removing the data: " + result);
    }
  });

  router.get("/init", async (_req: Request, res: Response) => {
    const clearResult = await GeneralServices.clearAll();
    if (clearResult !== true) {
      res.send("Error in removing the data: " + clearResult);
      return;
    }

    const initResult = await GeneralServices.initializeRoles();
    if (initResult !== true) {
      res.send("Error in initializing the data: " + initResult);
      return;
    } else {
      res.send(
        "Initial Data have been created at (" +
          getFormattedDate(new Date()) +
          ")"
      );
    }
  });

  router.get("/init_roles", async (_req: Request, res: Response) => {
    const clearResult = await GeneralServices.clearAll();
    if (clearResult !== true) {
      res.send("Error in removing the data: " + clearResult);
      return;
    }

    const initTestResult = await GeneralServices.initializeRoles();
    if (initTestResult !== true) {
      res.send("Error in initializing the test data: " + initTestResult);
      return;
    } else {
      res.send(
        "Test Data have been created at (" + getFormattedDate(new Date()) + ")"
      );
    }
  });

  router.get("/init_candidates", async (_req: Request, res: Response) => {
    const clearResult = await GeneralServices.clearAll();
    if (clearResult !== true) {
      res.send("Error in removing the data: " + clearResult);
      return;
    }

    const initTestResult = await GeneralServices.initializeCandidates();
    if (initTestResult !== true) {
      res.send("Error in initializing the test data: " + initTestResult);
      return;
    } else {
      res.send(
        "Test Data have been created at (" + getFormattedDate(new Date()) + ")"
      );
    }
  });

  return router;
};
