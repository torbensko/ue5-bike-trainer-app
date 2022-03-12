import { SofaWebsocketClient } from "./SofaWebsocketClient";
import { ControllerMsg, GameMsg } from "../types/Event";

const serverUrl = "wss://sofa-town-server.basement.network/controller";

export const websocketClient = new SofaWebsocketClient<ControllerMsg, GameMsg>(
  serverUrl
);
