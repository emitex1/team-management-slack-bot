import dotenv from "dotenv";

dotenv.config();

export const configs = {
  slack: {
    productName: process.env.PRODUCT_NAME || "TeamManagementSlackBot",
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_TOKEN,
    logChannelName:
      process.env.SLACK_LOG_CHANNEL_NAME || "team-management-bot-logs",
  },
  wit: {
    toekn: process.env.WIT_TOKEN,
  },
};

export type ConfigType = typeof configs;
