export type MessageBase = {
  event: string;
  data: unknown;
};

export type MessageForEvent<Evt, Msg extends MessageBase> = Msg & {
  event: Evt;
};
