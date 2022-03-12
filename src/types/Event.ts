// server -> game/controller
export enum ServerEvent {
  Init = "Init",
}

// game -> controller
export enum GameEvent {
  JoinGameResponse = "JoinGameResponse",
  SetGradient = "SetGradient",
  GameEnd = "GameEnd",
}

// controller -> game
export enum ControllerEvent {
  JoinGameRequest = "JoinGameRequest", // be aware - may be a returning player
  BikeSpeedMsg = "BikeSpeedMsg",
  Disconnected = "Disconnected",
}

// --- event objects ---
// server -> game/controller
export type InitMsg = {
  event: ServerEvent.Init;
  data: {
    // null when sent to controller
    gameCode: null | string;
  };
};
export type ServerMsg = InitMsg;

// game -> controller
export type JoinGameResponseMsg = {
  event: GameEvent.JoinGameResponse;
  controllerId: string;
  data:
    | {
        success: true;
      }
    | {
        success: false;
        error: string;
      };
};

export type SetGradientMsg = {
  event: GameEvent.SetGradient;
  controllerId: string;
  data: {
    gradient: number;
  };
};

// automatically dispatched to all controllers by server when game disconnects
export type GameEndMsg = {
  event: GameEvent.GameEnd;
  data: {};
};

export type GameMsg = JoinGameResponseMsg | SetGradientMsg | GameEndMsg;

// controller -> game
export type JoinGameRequestMsg = {
  event: ControllerEvent.JoinGameRequest;
  controllerId: string;
  data: {
    gameCode: string;
  };
};

export type BikeSpeedMsg = {
  event: ControllerEvent.BikeSpeedMsg;
  controllerId: string;
  data: {
    speed: number;
  };
};

// automatically dispatched to game by server when controller disconnects or fails heartbeat
export type DisconnectedMsg = {
  event: ControllerEvent.Disconnected;
  controllerId: string;
  data: {};
};

export type ControllerMsg = JoinGameRequestMsg | BikeSpeedMsg | DisconnectedMsg;
