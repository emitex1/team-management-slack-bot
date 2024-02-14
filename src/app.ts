import express, { Request, Response } from "express";
import logger from "morgan";
import { configs } from "./configs";
import { app } from "./server";
import { slackRouter } from "./routes/slackRoutes";
import { webPanelRouter } from "./routes/webPanelRoutes";
import { WitService } from "./services/WitServices";
import SessionService from "./services/SessionService";
import { Context } from "./types/Context";
import { CandidateService } from "./services/CandidateService";
import { ResponsibleService } from "./services/ResponsibleService";
import { GeneralServices } from "./services/GeneralServices";
import { getFormattedDate } from "./util/dateHelpers";
import cors from "cors";
import setupSwagger from "./util/setup_swagger";
import { RoleService } from "./services/RoleService";
import { generalRouter } from "./routes/generalRouter";

const corsOptions = {
  origin: (origin: string | undefined, callback: any) => {
    const now = new Date();
    console.log(
      "Caller origin = ",
      origin,
      " >>> ",
      now.toDateString(),
      ", ",
      now.toLocaleTimeString()
    );
    const allowedUrls = process.env.ALLOWED_URLS?.split(",") || [];
    if (!origin || allowedUrls.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
app.use(cors(corsOptions));

app.use(logger("dev"));

setupSwagger(app);

// error handler
app.use((err: any, req: Request, res: Response, _next: any) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  return res.send("error");
});

const witService = WitService(configs.wit.toekn!);
const sessionService = SessionService<Context>();
const generalService = GeneralServices();
const candidateService = CandidateService();
const responsibleService = ResponsibleService();
const roleService = RoleService();

// SlackBot api endpoints
app.use(
  "/api/slackbot",
  slackRouter(
    configs,
    witService,
    sessionService,
    candidateService,
    responsibleService
  )
);

// Add a json parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  "/api/webpanel",
  webPanelRouter(configs, candidateService, responsibleService, roleService)
);

app.use("/api", generalRouter(generalService));

// a basic api endpoint for test
app.get("/api/hi", (req: Request, res: Response) => {
  res.send("Hello Emad");
});
