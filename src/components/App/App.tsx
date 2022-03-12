import React, { useEffect, useState } from "react";
import "./App.scss";
import { GameCode } from "../GameCode/GameCode";
import { Layout } from "./components/Layout";
import { gameCodeFromUrl } from "./utilities/gameCodeFromUrl";

function App() {
  const [gameCode, setGameCode] = useState(gameCodeFromUrl());

  useEffect(() => {
    window.location.hash = gameCode;
  }, [gameCode]);

  if (gameCode.length !== 4) {
    // no hash available yet, prompt user to enter game code
    return (
      <Layout>
        <GameCode gameCode={gameCode} setGameCode={setGameCode} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        Code: <code>{gameCode}</code>
        <br />
        <button onClick={() => setGameCode("")}>Change code</button>
      </div>
    </Layout>
  );
}

export default App;
