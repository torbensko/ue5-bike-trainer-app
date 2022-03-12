import React from "react";
import ReactCodeInput from "react-code-input";

export type Props = {
  gameCode: string;
  setGameCode: React.Dispatch<React.SetStateAction<string>>;
};

export const GameCode: React.FC<Props> = ({ gameCode, setGameCode }) => {
  return (
    <div>
      Enter game code
      <br />
      <br />
      <ReactCodeInput
        type="text"
        fields={4}
        name="code"
        inputMode="latin"
        value={gameCode}
        onChange={setGameCode}
      />
    </div>
  );
};
