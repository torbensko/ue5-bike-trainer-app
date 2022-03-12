import React from "react";
import "./App.scss";
import { GameCode } from "../GameCode/GameCode";
import { Layout } from "./components/Layout";

function App() {
  if (window.location.hash === "") {
    // no hash available yet, prompt user to enter game code
    return (
      <Layout>
        <GameCode />
      </Layout>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
