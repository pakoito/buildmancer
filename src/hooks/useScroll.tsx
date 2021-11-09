import { Ref, useRef } from "react";

type ScrollToFn = () => void;

export default function useScroll<T extends Element>(scrollParams: ScrollIntoViewOptions): [ScrollToFn, Ref<any>] {
  const elRef = useRef<T>(null);
  const executeScroll = () => elRef.current!.scrollIntoView(scrollParams);

  return [executeScroll, elRef];
};
