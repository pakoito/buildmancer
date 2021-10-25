import { useEffect, useState } from "react";

export default function usePressedKeys(): Set<string> {
  // State for keeping track of whether key is pressed
  const [keyPressed, setKeyPressed] = useState(new Set<string>());
  // Add event listeners
  useEffect(() => {
    // @ts-ignore
    const downHandler = ({ key }) => {
      setKeyPressed((set) => new Set([...set, key]));
    }

    // @ts-ignore
    const upHandler = ({ key }) => {
      setKeyPressed((set) => new Set([...set].filter((v) => v === key)));
    };

    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, []);
  return keyPressed;
}