import {
  ChatPostMessageResponse,
  ErrorCode,
  LogLevel,
  WebClient,
} from "@slack/web-api";
import { createSessionId } from "./SessionService";
import { Session } from "../types/Session";
import { MentionEvent } from "../types/Slack";
import { Context } from "../types/Context";
import { ConversationService } from "./ConversationService";
import { CandidateServiceType } from "../types/CandidateService";
import { ResponsibleServiceType } from "../types/ResponsibleService";
import { configs } from "../configs";
import { elogRed } from "../util/logHelper";

export const handleMention = async (
  event: MentionEvent,
  witService: any,
  slackWebClient: WebClient,
  sessionService: any,
  candidateService: CandidateServiceType,
  responsibleService: ResponsibleServiceType
) => {
  const senderInfo = await getUserInfo(slackWebClient, event.user);

  const sessionId = createSessionId(
    event.channel,
    event.user,
    event.thread_ts || event.ts
  );
  let session: Session<Context> = sessionService.get(sessionId);

  if (!session) {
    session = sessionService.create(sessionId);

    session.context = {
      slack: {
        channel: event.channel,
        user: event.user,
        thread_ts: event.thread_ts || event.ts,
        senderFirstName: senderInfo?.first_name || "",
      },
      // conversation: { followUp: "" },
    };
  }

  processSlackEvent(
    event,
    witService,
    slackWebClient,
    session,
    candidateService,
    responsibleService
  );
};

export const handleMessage = async (
  event: MentionEvent,
  witService: any,
  slackWebClient: WebClient,
  sessionService: any,
  candidateService: CandidateServiceType,
  responsibleService: ResponsibleServiceType
) => {
  const sessionId = createSessionId(
    event.channel,
    event.user,
    event.thread_ts || event.ts
  );
  let session: Session<Context> = sessionService.get(sessionId);

  if (!session) return false;
  processSlackEvent(
    event,
    witService,
    slackWebClient,
    session,
    candidateService,
    responsibleService
  );
};

const processSlackEvent = async (
  event: MentionEvent,
  witService: any,
  slackWebClient: WebClient,
  session: Session<Context>,
  candidateService: CandidateServiceType,
  responsibleService: ResponsibleServiceType
) => {
  const mention = /<@[A-Z0-9]+>/;
  const eventText = event.text.replace(mention, "").trim();

  const context = await ConversationService.run(
    eventText,
    session.context,
    witService,
    candidateService,
    responsibleService
  );
  let answer = "";
  let answerFileName;
  let finalLog;

  if (!context?.conversation?.complete) {
    answer =
      context?.conversation?.followUp || "Sorry, I don't know what to say";
    answerFileName = context?.conversation?.followUpFileName;
    if (context && context.conversation)
      context.conversation.followUpFileName = "";
    finalLog = context?.log;
  } else {
    const { entities } = context.conversation;
    const neededRole = entities.role;
    const selectType = entities.select_type;
    answer = `You requested for a ${selectType} ${neededRole}. I will do it soon`;
  }

  if (context?.conversation?.complete || context?.conversation?.exit) {
    session.context.conversation = {
      entities: [],
      complete: false,
      exit: false,
      followUp: "",
      followUpFileName: undefined,
    };
  }

  let sendResult: ChatPostMessageResponse = {} as ChatPostMessageResponse;
  try {
    sendResult = await slackWebClient.chat.postMessage({
      text: answer,
      channel: session.context.slack.channel,
      username: configs.slack.productName,
      thread_ts: session.context.slack.thread_ts,
    });

    if (answerFileName) {
      // elog("answerFileName = ", answerFileName);
      sendResult = await slackWebClient.files.uploadV2({
        file: answerFileName,
        filename: answerFileName,
        channel_id: session.context.slack.channel,
        initial_comment: "Here is the winner",
        thread_ts: session.context.slack.thread_ts,
      });
    }

    if (finalLog) {
      sendToLogChannel(finalLog, session.context.slack.user, slackWebClient);
    }
    // elog("Message sent, result =", sendResult);
  } catch (e) {
    elogRed("Error in sending message", e);
  }
  return sendResult;
};

const getUserInfo = async (slackWebClient: WebClient, userId: string) => {
  try {
    return (await slackWebClient.users.info({ user: userId })).user?.profile;
  } catch (error: any) {
    if (error.code === ErrorCode.PlatformError) {
      elogRed("Error in getting user info :", error.data);
      return Promise.reject(error.data);
    } else {
      elogRed("Well, that was unexpected.");
      return Promise.reject("Well, that was unexpected.");
    }
  }
};

/**
 * Send the message to the logs channel
 * @param message the message
 * @param senderId the message sender that should be added to the logs channel
 * @param slackWebClient the slack web client
 */
export const sendToLogChannel = async (
  message: string,
  senderId?: string,
  slackWebClient?: WebClient
) => {
  // In case it is called from WebPanel, it will re-create the WebClient
  if (!slackWebClient) {
    slackWebClient = new WebClient(configs.slack.token, {
      logLevel: LogLevel.DEBUG,
    });
  }

  // In case it is called from WebPanel, it will look for Emad Armoun user to invite him to the logs channel
  if (!senderId) {
    const usersList = await slackWebClient.users.list();
    const emadUser = usersList.members?.find((member) => {
      const realName = member.profile?.real_name?.toLowerCase() || "";
      return realName.includes("emad") && realName.includes("armoun");
    });
    senderId = emadUser?.id;
  }

  const logsChannelName = configs.slack.logChannelName;
  let logsChannelId;

  const privateChannels = await slackWebClient.conversations.list({
    types: "private_channel",
  });
  const existingChannel = privateChannels.channels?.find(
    (channel) => channel.name === logsChannelName
  );

  if (existingChannel) {
    // if the logs channel already exists
    logsChannelId = existingChannel.id;
  } else {
    // if the logs channel doesn't exist, so should be created from scratch
    if (senderId) {
      // If a sender is provided, invite him to the logs channel, otherwise will not create the logs channel
      const channelCreateResponse = await slackWebClient.conversations.create({
        name: logsChannelName,
        is_private: true,
      });

      // invite the sender to the logs channel
      await slackWebClient.conversations.invite({
        channel: channelCreateResponse.channel?.id!,
        users: senderId,
      });

      // get the logs channel id
      logsChannelId = channelCreateResponse.channel?.id;
    }
  }

  if (logsChannelId) {
    // if the logs channel exists, send the message to it
    const sendResult = await slackWebClient.chat.postMessage({
      text: message,
      channel: logsChannelId,
      username: configs.slack.productName,
    });
    // elog("Log sent, result =", sendResult);
  }
};
