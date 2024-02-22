import { Profile } from "@slack/web-api/dist/response/UsersInfoResponse";
import internal from "stream";

export type Context = {
  slack: {
    channel: string;
    user: string;
    thread_ts: string;
    senderFirstName: string;
  };
  conversation?: {
    entities: any;
    followUp: string;
    followUpFileName?: string;
    complete: boolean;
    exit: boolean;
  };
  mention?: {
    user: Profile;
    memberId: string;
  };
  log?: string;
};
