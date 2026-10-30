import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "../types/auth/auth.types";
import { getRoleFromToken } from "../utils/jwt";

/**
 idle: chưa kiểm tra phiên (mới mở app)
 checking: đang gọi refresh-token để khôi phục phiên từ cookie
 */
export type AuthStatus = "idle" | "checking" | "authenticated" | "unauthenticated";

interface AuthState {
  // Access token chỉ nằm trên RAM, reload trang sẽ mất → lấy lại bằng refresh cookie
  accessToken: string | null;
  status: AuthStatus;
  // Thông tin người dùng đang đăng nhập, lấy từ GET /users/me
  user: AuthUser | null;
  // Vai trò lấy từ claim "role" của access token (USER, ADMIN...)
  role: string | null;
}

const initialState: AuthState = {
  accessToken: null,
  status: "idle",
  user: null,
  role: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setChecking: (state) => {
      state.status = "checking";
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.role = getRoleFromToken(action.payload);
      state.status = "authenticated";
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
    },
    clearAuth: (state) => {
      state.accessToken = null;
      state.user = null;
      state.role = null;
      state.status = "unauthenticated";
    },
  },
});

export const { setChecking, setAccessToken, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
