import { createContext, useContext } from "react";

// notification: thông báo realtime (icon chuông, hiện lâu hơn, có nút đóng)
export type ToastKind = "success" | "error" | "notification";

export interface ToastContextValue {
  /** duration: thời gian hiện (ms), mặc định 3s; riêng "notification" mặc định 8s */
  show: (message: string, kind?: ToastKind, duration?: number) => void;
}

export const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export const useToast = () => useContext(ToastContext);
