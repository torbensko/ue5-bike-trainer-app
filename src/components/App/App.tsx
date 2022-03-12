import React, { useCallback, useEffect, useRef, useState } from "react";
import "./App.scss";
import { GameCode } from "../GameCode/GameCode";
import { Layout } from "./components/Layout";
import { gameCodeFromUrl } from "./utilities/gameCodeFromUrl";
import { websocketClient } from "../../classes/WebsocketClient";
import {
  ControllerEvent,
  GameEvent,
  JoinGameResponseMsg,
  SetGradientMsg,
} from "../../types/Event";
import { controllerId } from "./utilities/controllerId";
import { RidingUI } from "../RidingUI/RidingUI";

export enum GameState {
  NotInGame = "NotInGame",
  PendingJoin = "PendingJoin",
  InGame = "InGame",
}

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [gameCode, setGameCode] = useState(gameCodeFromUrl());
  const [gameState, setGameState] = useState(GameState.NotInGame);
  const [gradient, setGradient] = useState(0);

  // connect to client on mount
  useEffect(() => {
    websocketClient
      .connect()
      .then(() => setIsConnected(true))
      .catch((e) => {
        console.error(e);
        alert("Unable to connect to server, please try again");
      });
  }, []);

  // store game code in URL & try and authenticate when it's ready
  useEffect(() => {
    window.location.hash = gameCode;

    if (isConnected && gameCode.length === 4) {
      // join game
      websocketClient.send({
        event: ControllerEvent.JoinGameRequest,
        controllerId,
        data: {
          gameCode,
        },
      });
      setGameState(GameState.PendingJoin);
    }
  }, [isConnected, gameCode]);

  // socket message handlers
  const handleJoinGameResponse = (msg: JoinGameResponseMsg) => {
    if (gameState !== GameState.PendingJoin) {
      // not sure why we got this message, throw it away
      console.warn(
        "Got JoinGameResponse while we weren't pending join...",
        msg
      );
      return;
    }

    if (msg.data.success) {
      setGameState(GameState.InGame);
    } else {
      setGameState(GameState.NotInGame);
      alert("Failed to join game: " + msg.data.error);
      setGameCode("");
    }
  };
  const handleJoinGameResponseRef = useRef(handleJoinGameResponse);
  handleJoinGameResponseRef.current = handleJoinGameResponse;

  const handleSetGradient = (msg: SetGradientMsg) => {
    setGradient(msg.data.gradient);
  };
  const handleSetGradientRef = useRef(handleSetGradient);
  handleSetGradientRef.current = handleSetGradient;

  // attach all our listeners
  useEffect(() => {
    const joinGameResponseWrapper = (msg: JoinGameResponseMsg) =>
      handleJoinGameResponseRef.current(msg);
    websocketClient.on(GameEvent.JoinGameResponse, joinGameResponseWrapper);

    const setGradientWrapper = (msg: SetGradientMsg) =>
      handleSetGradientRef.current(msg);
    websocketClient.on(GameEvent.SetGradient, setGradientWrapper);

    const handleGameEnd = () => {
      alert("Game ended");
    };
    websocketClient.on(GameEvent.GameEnd, handleGameEnd);

    // remove listeners on unmount
    return () => {
      websocketClient.off(GameEvent.JoinGameResponse, joinGameResponseWrapper);
      websocketClient.off(GameEvent.SetGradient, setGradientWrapper);
      websocketClient.off(GameEvent.GameEnd, handleGameEnd);
    };
  }, []);

  // set speed method to send our speed back to the game
  const setSpeed = useCallback((speed: number) => {
    websocketClient.send({
      event: ControllerEvent.BikeSpeedMsg,
      controllerId,
      data: {
        speed,
      },
    });
  }, []);

  if (!isConnected) {
    return (
      <div style={{ fontSize: 20, textAlign: "center", paddingTop: 50 }}>
        Connecting...
      </div>
    );
  }

  if (gameCode.length !== 4) {
    // no hash available yet, prompt user to enter game code
    return (
      <Layout>
        <GameCode gameCode={gameCode} setGameCode={setGameCode} />
      </Layout>
    );
  }

  if (gameState !== GameState.InGame) {
    return (
      <div style={{ fontSize: 20, textAlign: "center", paddingTop: 50 }}>
        Authenticating...
      </div>
    );
  }

  return (
    <Layout>
      <RidingUI setSpeed={setSpeed} gradient={gradient} />
      <br />
      <div>
        Code: <code>{gameCode}</code>
        <br />
        <button
          onClick={() => {
            setGameCode("");
            setGameState(GameState.NotInGame);
          }}
        >
          Change code
        </button>
      </div>
    </Layout>
  );
}

export default App;
