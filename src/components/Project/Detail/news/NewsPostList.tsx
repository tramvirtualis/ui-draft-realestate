import NewsCard from "../../../News/NewsCard";
import type { News } from "../../../../types/new/news.types";

type Props = {
  posts: News[];
};

// Cùng bố cục trang Tin tức chung: bài đầu khổ ngang chiếm cả hàng, các bài sau lưới 3 cột
export default function NewsPostList({ posts }: Props) {
  return (
    <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
      {posts.map((p, i) =>
        i === 0 ? (
          <div key={p.id} className="border-b border-line pb-12 sm:col-span-2 xl:col-span-3">
            <NewsCard news={p} wide />
          </div>
        ) : (
          <NewsCard key={p.id} news={p} />
        ),
      )}
    </div>
  );
}
