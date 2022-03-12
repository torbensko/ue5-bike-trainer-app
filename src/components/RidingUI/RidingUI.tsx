import React, { useEffect, useState } from "react";
import { TrainerBle } from "../TrainerBle/TrainerBle";

export type Props = {
  setSpeed: (speed: number) => void;
  gradient: number;
};

export const RidingUI: React.FC<Props> = ({ setSpeed, gradient }) => {
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);

  // push out local state up on change
  useEffect(() => {
    setSpeed(currentSpeed);
  }, [setSpeed, currentSpeed]);

  return (
    <div>
      <TrainerBle onSpeedUpdate={setCurrentSpeed} />
      <br />
      <br />
      Gradient: {gradient}
      <br />
      Speed: {currentSpeed}
      <br />
      <br />
      <button onClick={() => setCurrentSpeed((x) => x - 1)}>-</button>
      <button onClick={() => setCurrentSpeed((x) => x + 1)}>+</button>
    </div>
  );
};
