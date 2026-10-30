import { useCallback, useRef, useState } from "react";
import { getErrorMessage } from "../../api";
import socialUserService from "../../services/social/socialUserService";
import { toSocialUser, type SocialUser } from "../../types/social/social.types";

// Tìm người dùng theo tên: chỉ gọi API khi bấm nút tìm / Enter; lần tìm cũ về muộn thì bỏ qua
export function useUserSearch() {
  const [results, setResults] = useState<SocialUser[]>([]);
  // Từ khóa của kết quả đang hiện; "" = chưa tìm
  const [searched, setSearched] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(0);

  const search = useCallback(async (query: string) => {
    const keyword = query.trim();
    if (!keyword) return;
    const requestId = ++latest.current;
    setLoading(true);
    try {
      const users = await socialUserService.search(keyword);
      if (requestId !== latest.current) return;
      setResults(users.map(toSocialUser));
      setError(null);
    } catch (err) {
      if (requestId !== latest.current) return;
      setResults([]);
      setError(getErrorMessage(err));
    } finally {
      if (requestId === latest.current) {
        setSearched(keyword);
        setLoading(false);
      }
    }
  }, []);

  return { results, searched, loading, error, search };
}
