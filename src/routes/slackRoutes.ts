import express from "express";
import { ConfigType } from "../configs";
import { createEventAdapter } from "@slack/events-api";
import { LogLevel, WebClient } from "@slack/web-api";
import { handleMention, handleMessage } from "../services/slackServices";
import { CandidateServiceType } from "../types/CandidateService";
import { ResponsibleServiceType } from "../types/ResponsibleService";

export const slackRouter = (
  configs: ConfigType,
  witService: any,
  sessionService: any,
  candidateService: CandidateServiceType,
  responsibleService: ResponsibleServiceType
) => {
  const router = express.Router();

  // Slack Event to receive events from Slack
  const slackEvents = createEventAdapter(configs.slack.signingSecret!);
  // Slack Web Client to send messages to Slack
  const slackWebClient = new WebClient(configs.slack.token, {
    logLevel: LogLevel.DEBUG,
  });

  // A Basic Handler for Received Slack Events
  router.use("/events", slackEvents.requestListener());

  // Redirect Mention-typed events from Slack to a specific handler
  slackEvents.on("app_mention", (event) =>
    handleMention(
      event,
      witService,
      slackWebClient,
      sessionService,
      candidateService,
      responsibleService
    )
  );

  // Redirect Message-typed events from Slack to a specific handler
  slackEvents.on("message", (event) =>
    handleMessage(
      event,
      witService,
      slackWebClient,
      sessionService,
      candidateService,
      responsibleService
    )
  );

  return router;
};
