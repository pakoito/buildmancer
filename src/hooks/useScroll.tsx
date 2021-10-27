import { useRef } from "react";
import { Ref } from "react-bootstrap/node_modules/@types/react";

type ScrollToFn = () => void;

export default function useScroll<T extends Element>(scrollParams: ScrollIntoViewOptions): [ScrollToFn, Ref<any>] {
  const elRef = useRef<T>(null);
  const executeScroll = () => elRef.current!.scrollIntoView(scrollParams);

  return [executeScroll, elRef];
};