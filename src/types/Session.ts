export type Session<ContextType> = {
  creationTimestamp: number;
  context: ContextType;
};

export type Sessions<ContextType> = {
  [key: string]: Session<ContextType>;
};
