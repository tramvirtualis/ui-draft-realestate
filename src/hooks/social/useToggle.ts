import { useCallback, useState } from "react";

export function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  const setOn = useCallback(() => setValue(true), []);
  return { value, toggle, setOn };
}
