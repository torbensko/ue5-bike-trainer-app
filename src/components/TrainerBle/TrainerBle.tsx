import React, { useCallback, useRef, useState } from "react";
import { Measurement } from "./measurement";

type BleState = "not-connected" | "connecting" | "connected";

// TODO: make this clean up after itself properly (stop using ble on unmount)

const services = {
  cyclingPower: "00001818-0000-1000-8000-00805f9b34fb",
  speedCadence: "00001816-0000-1000-8000-00805f9b34fb",

  fitnessMachine: "00001826-0000-1000-8000-00805f9b34fb",
  fec: "6e40fec1-b5a3-f393-e0a9-e50e24dcca9e",
};
const characteristics = {
  // cyclingPowerMeasurement: "00002a63-0000-1000-8000-00805f9b34fb",
  // cyclingPowerFeature: "00002a65-0000-1000-8000-00805f9b34fb",
  // cyclingPowerControlPoint: "00002a66-0000-1000-8000-00805f9b34fb",

  speedCadenceMeasurement: "00002a5b-0000-1000-8000-00805f9b34fb",
};

export type Props = {
  onSpeedUpdate(speed: number): void;
};

export const TrainerBle: React.FC<Props> = ({ onSpeedUpdate }) => {
  const [state, setState] = useState<BleState>("not-connected");

  const onSpeedUpdateRef = useRef(onSpeedUpdate);
  onSpeedUpdateRef.current = onSpeedUpdate;

  const connectToDevice = useCallback(async () => {
    try {
      setState("connecting");
      console.log("Requesting Bluetooth Device...");
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          // { services: [services.fitnessMachine] },
          // { services: [services.speedCadence] },
          // { services: [services.cyclingPower] }, // WORKS
          { services: [services.fitnessMachine] }, // HAS USEFUL DATA
        ],
        optionalServices: [services.speedCadence],
      });

      console.log("Connecting to GATT Server...");
      const server = await device.gatt!.connect();

      console.log("Getting speed/cadence service...");
      const service = await server.getPrimaryService(services.speedCadence);

      // console.log("Fetching allChars");
      // const allChars = await service.getCharacteristics();
      // console.log("allChars", allChars);

      console.log("Getting measurement Characteristic...");
      const characteristic = await service.getCharacteristic(
        characteristics.speedCadenceMeasurement
      );

      console.log("Reading speed Level...");
      // const value = await characteristic.readValue();
      const measurement = Measurement();

      characteristic.addEventListener(
        "characteristicvaluechanged",
        (e: any) => {
          const { speed } = measurement.decode(e.target.value);
          console.log("Bike speed", speed);
          onSpeedUpdateRef.current(speed);
        }
      );
      await characteristic.startNotifications();

      setState("connected");
    } catch (error) {
      console.log("Argh! " + error);
      setState("not-connected");
    }
  }, []);

  if (state === "not-connected") {
    return <button onClick={connectToDevice}>Connect</button>;
  }
  if (state === "connecting") {
    return <button disabled>Connecting...</button>;
  }

  return <>Connected to device</>;
};
