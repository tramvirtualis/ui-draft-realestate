import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import authReducer from "./authSlice";
import { SUPER_ADMIN_ROLE } from "../utils/jwt";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Dùng 2 hook này thay cho useDispatch/useSelector để có kiểu sẵn
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.status === "authenticated";

// Thông tin user hiện tại (lấy từ GET /users/me), null nếu chưa đăng nhập
export const selectCurrentUser = (state: RootState) => state.auth.user;

export const selectRole = (state: RootState) => state.auth.role;
export const selectIsSuperAdmin = (state: RootState) => state.auth.role === SUPER_ADMIN_ROLE;

// Mã quyền trang quản trị từ GET /users/me; hằng số rỗng để selector không tạo mảng mới mỗi lần
const NO_PERMISSIONS: string[] = [];
export const selectPermissions = (state: RootState) =>
  state.auth.user?.permissions ?? NO_PERMISSIONS;

// Vào được khu quản trị: SUPER_ADMIN, hoặc role có ít nhất 1 quyền
export const selectCanAccessAdmin = (state: RootState) =>
  selectIsSuperAdmin(state) || selectPermissions(state).length > 0;
