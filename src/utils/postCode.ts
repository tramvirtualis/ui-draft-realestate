import { BASE_CONFIG } from "../api/core/config";

// Mã hóa id bài viết thành chuỗi 6 ký tự cho link chia sẻ (/social?post=k3Xq9P), để link không lộ id tăng dần.
// Đây là làm rối (đảo ngược được), không phải bảo mật: quyền xem bài vẫn do BE kiểm tra.
// Cách làm: nhân với số lẻ theo mod 2^32 (có nghịch đảo) rồi XOR với SALT, viết ra base62 bằng bảng chữ đã xáo trộn.

// PHẢI khớp hoàn toàn với PostCode.java bên BE (cùng bảng chữ, hệ số, SALT)
const ALPHABET = "q7Kx2PmZ9bVnT4cRwY8hLsD3fG6jUaE5kN1pXeH0rBtMzCyQiAoWuJgSvFlOdI";
const LENGTH = 6; // 62^6 > 2^32 nên đủ chứa mọi id 32-bit
const MULTIPLIER = 2654435761; // số lẻ ⇒ có nghịch đảo theo mod 2^32
const INVERSE = 244002641; // MULTIPLIER * INVERSE ≡ 1 (mod 2^32)
const SALT = 0x5bd1e995;
const MAX_ID = 2 ** 32;

export function encodePostId(id: number): string {
  let n = (Math.imul(id >>> 0, MULTIPLIER) ^ SALT) >>> 0;
  let code = "";
  for (let i = 0; i < LENGTH; i++) {
    code = ALPHABET[n % 62] + code;
    n = Math.floor(n / 62);
  }
  return code;
}

// null nếu chuỗi không phải mã hợp lệ (gõ sai, link cũ...)
export function decodePostCode(code: string | null | undefined): number | null {
  if (!code || code.length !== LENGTH) return null;
  let n = 0;
  for (const ch of code) {
    const digit = ALPHABET.indexOf(ch);
    if (digit < 0) return null;
    n = n * 62 + digit;
  }
  if (n >= MAX_ID) return null;
  const id = Math.imul((n ^ SALT) >>> 0, INVERSE) >>> 0;
  return id > 0 ? id : null;
}

// Link để copy / gửi đi: trang của BE có thẻ Open Graph nên Zalo / Messenger hiện khung xem trước
// (tiêu đề, đoạn trích, ảnh), người mở link được BE chuyển về /social?post=<mã>
// baseURL có thể là "/api" (proxy qua Vercel) → ghép với origin để luôn ra link tuyệt đối
export const postShareUrl = (id: number) => {
  const base = new URL(BASE_CONFIG.baseURL, window.location.origin).href.replace(/\/+$/, "");
  return `${base}/share/posts/${encodePostId(id)}`;
};
