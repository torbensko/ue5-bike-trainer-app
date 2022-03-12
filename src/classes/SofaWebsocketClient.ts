import { EventEmitter, EventHandler } from "./EventEmitter";
import { MessageBase, MessageForEvent } from "../types/MessageBase";
import { InitMsg, ServerEvent, ServerMsg } from "../types/Event";

export interface ISofaWebsocketClient<
  LocalMsg extends MessageBase,
  RemoteMsg extends MessageBase
> {
  connect(): Promise<InitMsg["data"]>;
  disconnect(): void;

  send<ThisEvent extends ThisMessage["event"], ThisMessage extends LocalMsg>(
    msg: MessageForEvent<ThisEvent, ThisMessage>
  ): void;

  on<ThisEvent extends ThisMessage["event"], ThisMessage extends RemoteMsg>(
    eventName: ThisEvent,
    handler: EventHandler<MessageForEvent<ThisEvent, ThisMessage>>
  ): void;

  off<ThisEvent extends ThisMessage["event"], ThisMessage extends RemoteMsg>(
    eventName: ThisEvent,
    handler: EventHandler<MessageForEvent<ThisEvent, ThisMessage>>
  ): void;

  registerDisconnectHandler(disconnectHandler: null | (() => void)): void;
}

export class SofaWebsocketClient<
  LocalMsg extends MessageBase,
  RemoteMsg extends MessageBase
> implements ISofaWebsocketClient<LocalMsg, RemoteMsg>
{
  private websocket: undefined | WebSocket = undefined;
  private eventEmitter = new EventEmitter<RemoteMsg["event"], RemoteMsg>();
  private handleServerInit: null | ((data: InitMsg) => void) = null;
  private disconnectHandler: null | (() => void) = null;

  constructor(private readonly serverUrl: string) {}

  public async connect() {
    if (this.websocket) {
      throw new Error("Socket already connected");
    }

    this.websocket = new WebSocket(this.serverUrl);

    this.websocket.onmessage = this.handleRawMessage.bind(this);
    this.websocket.onclose = () => {
      console.warn("Websocket closed");
      this.disconnectHandler && this.disconnectHandler();

      // reset internal state so we can connect again in future
      this.websocket = undefined;
      this.handleServerInit = null;
    };

    // store a promise that we can fire when we get an init message from the server
    const serverInitResponse = await new Promise<InitMsg>(
      (resolve) => (this.handleServerInit = resolve)
    );
    this.handleServerInit = null;

    return serverInitResponse.data;
  }

  public disconnect() {
    if (!this.websocket) {
      throw new Error("Socket not connected");
    }

    this.websocket.close();
    this.websocket = undefined;
    this.handleServerInit = null;
  }

  private handleRawMessage(event: MessageEvent) {
    if (event.data === "PING") {
      this.websocket!.send("PONG");
      return;
    }

    // parse data, we don't know if this is a server message yet so don't cast type
    const rawMsg: MessageBase = JSON.parse(event.data);

    // check if this was a server message...
    if (rawMsg.event === ServerEvent.Init) {
      if (this.handleServerInit === null) {
        throw new Error("unexpected init received from server");
      }
      this.handleServerInit(rawMsg as ServerMsg);
      return;
    }

    // not a server message, must be a remote message
    const message = rawMsg as RemoteMsg;

    // spread the news, got a remote message
    this.eventEmitter.emit(message.event, message);
  }

  public send<
    ThisEvent extends ThisMessage["event"],
    ThisMessage extends LocalMsg
  >(msg: MessageForEvent<ThisEvent, ThisMessage>) {
    if (!this.websocket || this.handleServerInit !== null) {
      throw new Error("Socket not connected or ready");
    }

    this.websocket.send(JSON.stringify(msg));
  }

  public on<
    ThisEvent extends ThisMessage["event"],
    ThisMessage extends RemoteMsg
  >(
    eventName: ThisEvent,
    handler: EventHandler<MessageForEvent<ThisEvent, ThisMessage>>
  ): void {
    return this.eventEmitter.on(eventName, handler as EventHandler<RemoteMsg>);
  }

  public off<
    ThisEvent extends ThisMessage["event"],
    ThisMessage extends RemoteMsg
  >(
    eventName: ThisEvent,
    handler: EventHandler<MessageForEvent<ThisEvent, ThisMessage>>
  ): void {
    return this.eventEmitter.off(eventName, handler as EventHandler<RemoteMsg>);
  }

  public registerDisconnectHandler(
    disconnectHandler: null | (() => void)
  ): void {
    this.disconnectHandler = disconnectHandler;
  }
}
