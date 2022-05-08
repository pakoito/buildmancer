import React from "react";

export function useForceRerender() {
  const [value, setValue] = React.useState(false);
  return () => setValue(!value);
}
