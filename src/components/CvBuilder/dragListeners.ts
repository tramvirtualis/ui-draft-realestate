import type { SyntheticEvent } from "react";
import type { DraggableSyntheticListeners } from "@dnd-kit/core";

const INTERACTIVE =
  "input, textarea, select, button, a, [contenteditable='true']";

//Cho kéo cả thẻ thay vì chỉ icon 6 chấm
export function wholeCardListeners(listeners: DraggableSyntheticListeners) {
  if (!listeners) return undefined;
  const wrapped: Record<string, (e: SyntheticEvent) => void> = {};
  for (const [name, handler] of Object.entries(listeners)) {
    wrapped[name] = (e) => {
      const target = e.target as HTMLElement;
      if (target !== e.currentTarget && target.closest(INTERACTIVE)) return;
      handler(e);
    };
  }
  return wrapped;
}
