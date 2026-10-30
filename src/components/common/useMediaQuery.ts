import { useSyncExternalStore } from "react";

/** true khi viewport khớp media query, vd: useMediaQuery("(min-width: 1024px)") */
export default function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", notify);
      return () => mq.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
