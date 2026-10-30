import { useEffect, useRef, useState, type FormEvent } from "react";
import { getErrorMessage } from "../../api";
import profileService from "../../services/user/profileService";
import type { AuthUser } from "../../types/auth/auth.types";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // khớp giới hạn bên BE
const MAX_NAME_LENGTH = 100;
// Giống RegisterRequest bên BE
const PHONE_PATTERN = /^(0?)(3[2-9]|5[6|7|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;

// Form sửa hồ sơ: họ tên, số điện thoại, ảnh đại diện (xem trước trên máy, bấm Lưu mới upload)
export function useProfileForm(user: AuthUser, onSaved: () => void) {
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone ?? "");
  // Ảnh mới chọn + link blob: để xem trước trên máy (chưa upload)
  const [avatar, setAvatar] = useState<{ file: File; previewUrl: string } | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rời trang thì giải phóng link xem trước đang giữ
  const previewRef = useRef<string | null>(null);
  useEffect(() => {
    previewRef.current = avatar?.previewUrl ?? null;
  }, [avatar]);
  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
  }, []);

  const replaceAvatar = (next: File | null) => {
    if (avatar) URL.revokeObjectURL(avatar.previewUrl);
    setAvatar(next ? { file: next, previewUrl: URL.createObjectURL(next) } : null);
  };

  const avatarUrl = avatar?.previewUrl ?? (removeAvatar ? null : user.avatarUrl ?? null);
  const dirty =
    fullName.trim() !== user.fullName || phone.trim() !== (user.phone ?? "") || avatar !== null || removeAvatar;

  const reset = () => {
    setFullName(user.fullName);
    setPhone(user.phone ?? "");
    replaceAvatar(null);
    setRemoveAvatar(false);
    setError(null);
  };

  const pickAvatar = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Ảnh đại diện phải là file ảnh");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError("Ảnh đại diện tối đa 5MB");
      return;
    }
    setError(null);
    replaceAvatar(file);
    setRemoveAvatar(false);
  };

  const clearAvatar = () => {
    replaceAvatar(null);
    setRemoveAvatar(true);
  };

  const validate = (): string | null => {
    const name = fullName.trim();
    if (!name) return "Họ và tên không được để trống";
    if (name.length > MAX_NAME_LENGTH) return `Họ và tên tối đa ${MAX_NAME_LENGTH} ký tự`;
    if (phone.trim() && !PHONE_PATTERN.test(phone.trim())) return "Số điện thoại không hợp lệ";
    return null;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = await profileService.updateProfile({ fullName, phone, avatar: avatar?.file, removeAvatar });
      // Lấy lại giá trị đã lưu (BE đã trim) làm mốc so sánh mới
      setFullName(saved.fullName);
      setPhone(saved.phone ?? "");
      replaceAvatar(null);
      setRemoveAvatar(false);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return {
    fullName,
    setFullName,
    phone,
    setPhone,
    avatarUrl,
    hasAvatar: avatarUrl !== null,
    pickAvatar,
    clearAvatar,
    dirty,
    saving,
    error,
    reset,
    submit,
  };
}
