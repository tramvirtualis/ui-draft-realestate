import { useEffect } from "react";

export type SeoOptions = {
  title: string;
  description: string;
  canonical: string;
  image?: string | null;
  type?: "website" | "article";
  jsonLd?: object[];
};

const setMeta = (attr: "name" | "property", key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    el.dataset.seo = "1";
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

// Cập nhật thẻ <head> cho trang (SPA); trả lại tiêu đề cũ khi rời trang
export function useSeo({ title, description, canonical, image, type = "website", jsonLd }: SeoOptions) {
  const ldKey = JSON.stringify(jsonLd ?? []);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", type);
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:site_name", "Đất Việt Group");
    setMeta("property", "og:locale", "vi_VN");
    setMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    if (image) {
      setMeta("property", "og:image", image);
      setMeta("name", "twitter:image", image);
    }

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonical;

    const scripts: HTMLScriptElement[] = (JSON.parse(ldKey) as object[]).map((data) => {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.dataset.seo = "1";
      s.text = JSON.stringify(data);
      document.head.appendChild(s);
      return s;
    });

    return () => {
      document.title = previousTitle;
      scripts.forEach((s) => s.remove());
    };
  }, [title, description, canonical, image, type, ldKey]);
}
