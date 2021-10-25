import { useEffect, useCallback, useState } from "react";

export default function usePressedKeys(onUp: (e: string) => void): Set<string> {

  const [pressedKeys, updatePressedKeys] = useState(new Set<string>());

  const downHandler = ({ key }: { key: string }) => {
    updatePressedKeys((set) => new Set([...set, key]));
  }

  const upHandler = useCallback(({ key }: { key: string }) => {
    updatePressedKeys((set) => new Set([...set].filter((k) => k !== key)));
    onUp(key);
  }, [onUp]);

  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, [upHandler]);

  return pressedKeys;
}