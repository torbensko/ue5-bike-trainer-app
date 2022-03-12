import React from "react";
import ReactCodeInput from "react-code-input";

export const GameCode: React.FC = () => {
  return <ReactCodeInput type="number" fields={4} name="code" inputMode="latin" />;
};