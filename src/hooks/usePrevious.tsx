import { useRef, useEffect, MutableRefObject } from "react";

export default function usePrevious<T>(value: T): MutableRefObject<T> {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref as MutableRefObject<T>;
}
