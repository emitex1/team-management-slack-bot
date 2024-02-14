import { Session, Sessions } from "../types/Session";

export const createSessionId = (channel: string, user: string, ts: string) => {
  return `${channel}-${user}-${ts}`;
};

const SessionService = <ContextType>() => {
  const sessions: Sessions<ContextType> = {};

  // 5 Minutes timeout
  const timeout: number = 60 * 5;

  // Get current timestamp in seconds
  const now = (): number => {
    return Math.floor((new Date() as any) / 1000);
  };

  const create = (sessionId: string): Session<ContextType> => {
    cleanup();
    sessions[sessionId] = {
      creationTimestamp: now(),
      context: {} as ContextType,
    };

    return sessions[sessionId];
  };

  const get = (sessionId: string): Session<ContextType> | false => {
    cleanup();
    if (!sessions[sessionId]) return false;
    update(sessionId);
    return sessions[sessionId];
  };

  const deleteSession = (sessionId: string): boolean => {
    if (!sessions[sessionId]) return false;
    delete sessions[sessionId];
    return true;
  };

  // Update session's creation time
  const update = (sessionId: string): Session<ContextType> | false => {
    cleanup();
    if (!sessions[sessionId]) return false;
    sessions[sessionId].creationTimestamp = now();
    return sessions[sessionId];
  };

  // Remove all the sessions that are out of timeout
  const cleanup = (): true => {
    const nowTimestamp = now();

    Object.keys(sessions).forEach((sessionId: string) => {
      const session = sessions[sessionId];
      if (session.creationTimestamp + timeout < nowTimestamp) {
        deleteSession(sessionId);
      }
    });
    return true;
  };

  return { create, get };
};

export default SessionService;
